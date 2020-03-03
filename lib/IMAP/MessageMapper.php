<?php

declare(strict_types=1);

/**
 * @author Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * Mail
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

namespace OCA\Mail\IMAP;

use Horde_Imap_Client;
use Horde_Imap_Client_Base;
use Horde_Imap_Client_Data_Fetch;
use Horde_Imap_Client_Exception;
use Horde_Imap_Client_Fetch_Query;
use Horde_Imap_Client_Ids;
use Horde_Imap_Client_Socket;
use Horde_Mime_Mail;
use Horde_Mime_Part;
use OCA\Mail\Db\Mailbox;
use OCA\Mail\Exception\ServiceException;
use OCA\Mail\Model\IMAPMessage;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\ILogger;
use function iterator_to_array;

class MessageMapper {

	/** @var ILogger */
	private $logger;

	public function __construct(ILogger $logger) {
		$this->logger = $logger;
	}

	/**
	 * @return IMAPMessage
	 * @throws DoesNotExistException
	 * @throws Horde_Imap_Client_Exception
	 */
	public function find(Horde_Imap_Client_Base $client,
						 string $mailbox,
						 int $id,
						 bool $loadBody = false): IMAPMessage {
		$result = $this->findByIds($client, $mailbox, [$id], $loadBody);

		if (count($result) === 0) {
			throw new DoesNotExistException("Message does not exist");
		}

		return $result[0];
	}

	/**
	 * @param Horde_Imap_Client_Socket $client
	 * @param Mailbox $mailbox
	 *
	 * @return IMAPMessage[]
	 * @throws Horde_Imap_Client_Exception
	 */
	public function findAll(Horde_Imap_Client_Socket $client, Mailbox $mailbox): array {
		$query = new Horde_Imap_Client_Fetch_Query();
		$query->uid();

		return $this->findByIds(
			$client,
			$mailbox->getMailbox(),
			array_map(
				function(Horde_Imap_Client_Data_Fetch $data) {
					return $data->getUid();
				},
				iterator_to_array($client->fetch(
					$mailbox->getMailbox(),
					$query,
					[]
				))
			)
		);
	}

	/**
	 * @return IMAPMessage[]
	 * @throws Horde_Imap_Client_Exception
	 */
	public function findByIds(Horde_Imap_Client_Base $client,
							  string $mailbox,
							  array $ids,
							  bool $loadBody = false): array {
		$query = new Horde_Imap_Client_Fetch_Query();
		$query->envelope();
		$query->flags();
		$query->uid();
		$query->imapDate();

		$fetchResults = iterator_to_array($client->fetch($mailbox, $query, [
			'ids' => new Horde_Imap_Client_Ids($ids),
		]), false);

		return array_map(function (Horde_Imap_Client_Data_Fetch $fetchResult) use ($client, $mailbox, $loadBody) {
			if ($loadBody) {
				return new IMAPMessage(
					$client,
					$mailbox,
					$fetchResult->getUid(),
					null,
					$loadBody
				);
			} else {
				return new IMAPMessage(
					$client,
					$mailbox,
					$fetchResult->getUid(),
					$fetchResult
				);
			}
		}, $fetchResults);
	}

	/**
	 * @param Horde_Imap_Client_Base $client
	 * @param string $sourceFolderId
	 * @param int $messageId
	 * @param string $destFolderId
	 */
	public function move(Horde_Imap_Client_Base $client,
						 string $sourceFolderId,
						 int $messageId,
						 string $destFolderId): void {
		try {
			$client->copy($sourceFolderId, $destFolderId,
				[
					'ids' => new Horde_Imap_Client_Ids($messageId),
					'move' => true,
				]);
		} catch (Horde_Imap_Client_Exception $e) {
			$this->logger->logException(
				$e,
				['level' => ILogger::DEBUG]
			);

			throw new ServiceException(
				"Could not move message $$messageId from $sourceFolderId to $destFolderId",
				0,
				$e
			);
		}
	}

	public function markAllRead(Horde_Imap_Client_Base $client,
								string $mailbox): void {
		$client->store($mailbox, [
			'add' => [
				Horde_Imap_Client::FLAG_SEEN,
			],
		]);
	}

	/**
	 * @throws ServiceException
	 */
	public function expunge(Horde_Imap_Client_Base $client,
							string $mailbox,
							int $id): void {
		try {
			$client->expunge(
				$mailbox,
				[
					'ids' => new Horde_Imap_Client_Ids([$id]),
					'delete' => true,
				]);
		} catch (Horde_Imap_Client_Exception $e) {
			$this->logger->logException(
				$e,
				['level' => ILogger::DEBUG]
			);

			throw new ServiceException("Could not expunge message $id", 0, $e);
		}

		$this->logger->info(
			"Message expunged: {message} from mailbox {mailbox}",
			[
				'message' => $id,
				'mailbox' => $mailbox,
			]
		);
	}

	/**
	 * @throws Horde_Imap_Client_Exception
	 */
	public function save(Horde_Imap_Client_Socket $client,
						 Mailbox $mailbox,
						 Horde_Mime_Mail $mail,
						 array $flags = []): int {
		$flags = array_merge([
			Horde_Imap_Client::FLAG_SEEN,
		], $flags);

		$uids = $client->append(
			$mailbox->getName(),
			[
				[
					'data' => $mail->getRaw(),
					'flags' => $flags,
				]
			]
		);

		return (int)$uids->current();
	}

	/**
	 * @throws Horde_Imap_Client_Exception
	 */
	public function addFlag(Horde_Imap_Client_Socket $client,
							Mailbox $mailbox,
							int $uid,
							string $flag): void {
		$client->store(
			$mailbox->getName(),
			[
				'ids' => new Horde_Imap_Client_Ids($uid),
				'add' => [$flag],
			]
		);
	}

	public function fetchFullText(Horde_Imap_Client_Base $client,
							string $mailbox,
							array $ids): array {
		$query = new Horde_Imap_Client_Fetch_Query();
		$query->fullText();
		$fetchResults = iterator_to_array($client->fetch($mailbox, $query, [
			'ids' => new Horde_Imap_Client_Ids($ids),
		]), false);
		return array_map(function (Horde_Imap_Client_Data_Fetch $fetchResult) {
			return $fetchResult->getFullMsg();
		}, $fetchResults);
	}
	
	public function getHtmlBody(Horde_Imap_Client_Socket $client,
								string $mailbox,
								int $id): ?string {
		$messageQuery = new Horde_Imap_Client_Fetch_Query();
		$messageQuery->envelope();
		$messageQuery->structure();

		$result = $client->fetch($mailbox, $messageQuery, [
			'ids' => new Horde_Imap_Client_Ids([$id]),
		]);

		if (($message = $result->first()) === null) {
			throw new DoesNotExistException('Message does not exist');
		}

		$structure = $message->getStructure();
		$htmlPartId = $structure->findBody('html');
		if ($htmlPartId === null) {
			// No HTML part
			return null;
		}
		$partsQuery = new Horde_Imap_Client_Fetch_Query();
		$partsQuery->fullText();
		foreach ($structure->partIterator() as $structurePart) {
			/** @var Horde_Mime_Part $structurePart */
			$partsQuery->bodyPart($structurePart->getMimeId(), [
				'decode' => true,
				'peek' => true,
			]);
			$partsQuery->bodyPartSize($structurePart->getMimeId());
			if ($structurePart->getMimeId() === $htmlPartId) {
				$partsQuery->mimeHeader($structurePart->getMimeId(), [
					'peek' => true
				]);
			}
		}

		$parts = $client->fetch($mailbox, $partsQuery, [
			'ids' => new Horde_Imap_Client_Ids([$id]),
		]);

		foreach ($parts as $part) {
			/** @var Horde_Imap_Client_Data_Fetch $part */
			$body = $part->getBodyPart($htmlPartId);
			if ($body !== null) {
				$mimeHeaders = $part->getMimeHeader($htmlPartId, Horde_Imap_Client_Data_Fetch::HEADER_PARSE);
				if ($enc = $mimeHeaders->getValue('content-transfer-encoding')) {
					$structure->setTransferEncoding($enc);
				}
				$structure->setContents($body);
				return $structure->getContents();
			}
		}

		return null;
	}

	public function getRawAttachments(Horde_Imap_Client_Socket $client,
									  string $mailbox,
									  int $id): array {
		$messageQuery = new Horde_Imap_Client_Fetch_Query();
		$messageQuery->structure();

		$result = $client->fetch($mailbox, $messageQuery, [
			'ids' => new Horde_Imap_Client_Ids([$id]),
		]);

		if (($structureResult = $result->first()) === null) {
			throw new DoesNotExistException('Message does not exist');
		}

		$structure = $structureResult->getStructure();
		$partsQuery = new Horde_Imap_Client_Fetch_Query();
		$partsQuery->fullText();
		foreach ($structure->partIterator() as $part) {
			/** @var Horde_Mime_Part $part */
			if ($part->getMimeId() === '0') {
				// Ignore message header
				continue;
			}

			$partsQuery->bodyPart($part->getMimeId(), [
				'peek' => true,
			]);
			$partsQuery->mimeHeader($part->getMimeId(), [
				'peek' => true
			]);
			$partsQuery->bodyPartSize($part->getMimeId());
		}

		$parts = $client->fetch($mailbox, $partsQuery, [
			'ids' => new Horde_Imap_Client_Ids([$id]),
		]);
		if (($messageData = $parts->first()) === null) {
			throw new DoesNotExistException('Message does not exist');
		}

		$attachments = [];
		foreach ($structure->partIterator() as $key => $part) {
			/** @var Horde_Mime_Part $part */

			if (!$part->isAttachment()) {
				continue;
			}

			$stream = $messageData->getBodyPart($key, true);
			$mimeHeaders = $messageData->getMimeHeader($key, Horde_Imap_Client_Data_Fetch::HEADER_PARSE);
			if ($enc = $mimeHeaders->getValue('content-transfer-encoding')) {
				$part->setTransferEncoding($enc);
			}
			$part->setContents($stream, [
				'usestream' => true,
			]);
			$decoded = $part->getContents();

			$attachments[] = $decoded;
		}
		return $attachments;
	}

	/**
	 * @param Horde_Imap_Client_Socket $client
	 * @param int[] $uids
	 *
	 * @return MessageStructureData[]
	 * @throws Horde_Imap_Client_Exception
	 */
	public function getBodyStructureData(Horde_Imap_Client_Socket $client,
										 string $mailbox,
										 array $uids): array {
		$structureQuery = new Horde_Imap_Client_Fetch_Query();
		$structureQuery->structure();

		$structures = $client->fetch($mailbox, $structureQuery, [
			'ids' => new Horde_Imap_Client_Ids($uids),
		]);

		return array_map(function(Horde_Imap_Client_Data_Fetch $fetchData) use ($mailbox, $client) {
			$hasAttachments = false;
			$text = '';

			$structure = $fetchData->getStructure();
			foreach ($structure as $part) {
				if ($part instanceof Horde_Mime_Part && $part->isAttachment()) {
					$hasAttachments = true;
					break;
				}
			}

			$textBodyId = $structure->findBody('text');
			// $htmlBodyId = $structure->findBody('html');
			// $htmlBody = $data->getBodyPart($htmlBodyId);

			$partsQuery = new Horde_Imap_Client_Fetch_Query();
			if ($textBodyId === null) {
				return new MessageStructureData($hasAttachments, $text);
			}
			$partsQuery->bodyPart($textBodyId, [
				'decode' => true,
				'peek' => true,
			]);
			$partsQuery->mimeHeader($textBodyId, [
				'peek' => true
			]);
			$parts = $client->fetch($mailbox, $partsQuery, [
				'ids' => new Horde_Imap_Client_Ids([$fetchData->getUid()]),
			]);
			/** @var Horde_Imap_Client_Data_Fetch $part */
			$part = $parts[$fetchData->getUid()];
			$body = $part->getBodyPart($textBodyId);

			if (!empty($body)) {
				$mimeHeaders = $fetchData->getMimeHeader($textBodyId, Horde_Imap_Client_Data_Fetch::HEADER_PARSE);
				if ($enc = $mimeHeaders->getValue('content-transfer-encoding')) {
					$structure->setTransferEncoding($enc);
				}
				$structure->setContents($body);
				/** @var string $text */
				$text = $structure->getContents();
			}

			return new MessageStructureData($hasAttachments, $text);
 		}, iterator_to_array($structures->getIterator()));
	}

}

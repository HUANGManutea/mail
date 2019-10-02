<?php declare(strict_types=1);

namespace OCA\Mail\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\IDBConnection;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

class Version0190Date20191002091034 extends SimpleMigrationStep {

	/** @var IDBConnection */
	protected $connection;

	public function __construct(IDBConnection $connection) {
		$this->connection = $connection;
	}

	/**
	 * @param IOutput $output
	 * @param Closure $schemaClosure The `\Closure` returns a `ISchemaWrapper`
	 * @param array $options
	 *
	 * @return ISchemaWrapper
	 */
	public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
		/** @var ISchemaWrapper $schema */
		$schema = $schemaClosure();

		$messagesTable = $schema->createTable('mail_messages');
		$messagesTable->addColumn('id', 'integer', [
			'autoincrement' => true,
			'notnull' => true,
			'length' => 20,
		]);
		$messagesTable->addColumn('uid', 'integer', [
			'notnull' => true,
			'length' => 4,
		]);
		$messagesTable->addColumn('message_id', 'string', [
			'notnull' => false,
			'length' => 255,
		]);
		$messagesTable->addColumn('mailbox_id', 'string', [
			'notnull' => true,
			'length' => 4,
		]);
		$messagesTable->addColumn('from', 'text', [
			'default' => '',
		]);
		$messagesTable->addColumn('to', 'text', [
			'default' => '',
		]);
		$messagesTable->addColumn('cc', 'text', [
			'default' => '',
		]);
		$messagesTable->addColumn('bcc', 'text', [
			'default' => '',
		]);
		$messagesTable->addColumn('subject', 'string', [
			'length' => 255,
			'default' => '',
		]);
		$messagesTable->addColumn('sent_at', 'integer', [
			'notnull' => true,
			'length' => 4,
		]);
		$messagesTable->addColumn('flags', 'string', [
			'length' => 255,
			'default' => '[]',
		]);
		$messagesTable->setPrimaryKey(['id']);
		// We allow each UID just once
		$messagesTable->addUniqueIndex([
			'mailbox_id',
			'uid',
		]);

		return $schema;
	}

	public function postSchemaChange(IOutput $output, Closure $schemaClosure, array $options) {
		// Force a re-sync
		$update = $this->connection->getQueryBuilder();
		$update->update('mail_mailboxes')
			->set('sync_token', $update->createNamedParameter(null));

		$update->execute();
	}

}

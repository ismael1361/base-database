import { Table } from "./Table";
import BasicEventEmitter, { EventsListeners } from "basic-event-emitter";
import { ExtractTableRow } from "./Types";

type Events = EventsListeners<{}>;

export abstract class Schema extends BasicEventEmitter<Events> {
	constructor(private table: Table<any>) {
		super();
	}

	abstract creator(): Schema;

	abstract serializer(): ExtractTableRow<typeof this.table>;
}

import { ObjectId } from "mongo";
import { Evento } from "../types.ts";


export type EventosSchema = Omit<Evento, "id"> & {
    _id: ObjectId;
};


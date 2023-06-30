import { getQuery } from "oak/helpers.ts";
import { Database, ObjectId } from "mongo";
import { RouterContext } from "oak/router.ts";
import { EventosSchema } from "../db/schema.ts";
import { EventosCollection } from "../db/dbconnection.ts";

type DeleteEventConIdContext = RouterContext<
  "/deleteEvent/:id",
  {
    id: string;
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;

export const deleteEventConID = async (context: DeleteEventConIdContext) => {
  try {
    if (context.params?.id) {
      const id: string = context.params.id;

      const eventoEncontrado: EventosSchema | undefined =
        await EventosCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!eventoEncontrado) {
          context.response.body = { msg: "No se ha encontrado ningun evento con ese id", };
          context.response.status = 404;
          return;
        } 

        await EventosCollection.deleteOne({
          _id: new ObjectId(id),
        });

        
        context.response.status = 200; 
    }
    else {
      context.response.body = { msg: "No se ha introducido el parametro id" };
      context.response.status = 404;
      return;
    }
  } catch (error) {
    console.log(error);
    context.response.status = 500;
  }
};

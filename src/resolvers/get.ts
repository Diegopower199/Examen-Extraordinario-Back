import { RouterContext } from "oak/router.ts";
import { ObjectId } from "mongo";
import { EventosCollection } from "../db/dbconnection.ts";
import { EventosSchema } from "../db/schema.ts";

type GetEventsContext = RouterContext<
  "/events",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

export const getEvents = async (context: GetEventsContext) => {
  try {

    const events = await EventosCollection.find({
      fecha: { $gte: new Date() },
    }).sort( { fecha: 1, inicio: 1 }).toArray();

    context.response.body = events;
    context.response.status = 200;

  } catch (error) {
    console.log(error);
    context.response.status = 500;
  }
};

type GetEventConIdContext = RouterContext<
  "/event/:id",
  {
    id: string;
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;

export const getEventPorId = async (context: GetEventConIdContext) => {
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

        context.response.body = {
          _id: eventoEncontrado._id,
          titulo: eventoEncontrado.titulo,
          descripcion: eventoEncontrado.descripcion,
          fecha: eventoEncontrado.fecha,
          inicio: eventoEncontrado.inicio,
          fin: eventoEncontrado.fin,
          invitados: eventoEncontrado.invitados
        };
        context.response.status = 200; 
    }
    else {
      context.response.body = { msg: "No se ha introducido el parametro id" };
      context.response.status = 400;
      return;
    }
  } catch (error) {
    console.log(error);
    context.response.status = 500;
  }
};

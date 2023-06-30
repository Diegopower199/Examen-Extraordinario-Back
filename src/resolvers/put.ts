import { getQuery } from "oak/helpers.ts";
import { Database, ObjectId } from "mongo";
import { RouterContext } from "oak/router.ts";
import { EventosCollection } from "../db/dbconnection.ts";


type PutUpdateEventContext = RouterContext<
  "/updateEvent",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

export const putUpdateEvent = async (context: PutUpdateEventContext) => {
  try {
    
    const params = context.request.body({ type: "json" });
    const value = await params.value;

    console.log(value);


    if (!value.id || !value.titulo || !value.fecha || !value.inicio || !value.fin || !value.invitados) {
      context.response.body = { msg: "Falta algun parametro de estos {id, titulo, fecha, inicio, fin, invitados} ", };
      context.response.status = 400;
      return;
    }

    const { id, titulo, descripcion, fecha, inicio, fin, invitados } = value;

    const expresionRegularObjectId = /^[0-9a-fA-F]{24}$/;

    if (id.match(expresionRegularObjectId) === null) {
      context.response.body = { msg: "La campo id no tiene el formato de ObjectId", };
      context.response.status = 404;
      return;
    }

    if (typeof titulo !== "string") {
      context.response.body = { msg: "La campo titulo no es de tipo string", };
      context.response.status = 404;
      return;
    }

    if (typeof descripcion !== "string" && typeof descripcion !== "undefined") {
      context.response.body = { msg: "La campo descripcion no es de tipo string", };
      context.response.status = 404;
      return;
    }

    
    const expresionRegularFecha = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;

    if (fecha.match(expresionRegularFecha) === null) {
      context.response.body = { msg: "La campo fecha debe tener este formato yyyy/mm/dd", };
      context.response.status = 404;
      return;
    }

    if (typeof inicio !== "number" || !Number.isInteger(inicio)) {
      context.response.body = { msg: "El campo inicio no es de tipo entero (number)", };
      context.response.status = 404;
      return;
    }

    if (typeof fin !== "number" || !Number.isInteger(fin)) {
      context.response.body = { msg: "El campo fin no es de tipo entero (number)", };
      context.response.status = 404;
      return;
    }

    if (!Array.isArray(invitados) || !invitados.every((item) => typeof item === "string")) {
      context.response.body = { msg: "La variable invitados no es un array de strings", };
      context.response.status = 404;
      return;
    }

    if (inicio >= fin) {
      context.response.body = { msg: "La hora de finalizacion no puede ser menor o igual que la de inicio", };
      context.response.status = 400;
      return;
    }

    console.log(inicio < 0)
    if (inicio < 0) {
      context.response.body = { msg: "La hora de inicio no puede ser menor que 0", };
      context.response.status = 404;
      return;
    }

    if (fin > 24) {
      context.response.body = { msg: "La hora de fin no puede ser mayor que 24", };
      context.response.status = 404;
      return;
    }

    const eventoEncontrado = await EventosCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!eventoEncontrado) {
      context.response.body = { msg: "No existe el id del evento", };
      context.response.status = 404;
      return;
    }

    // check if there is a Event already in that date and time
    const eventInSameDate = await EventosCollection.findOne({
      fecha: new Date(fecha),
      $or: [
        { inicio: { $gt: inicio, $lt: fin } },
        { fin: { $gt: inicio, $lt: fin } },
      ],
    });

    if (eventInSameDate && eventInSameDate._id.toString() !== id) {
      context.response.body = { msg: "Solapamiento de eventos", };
      context.response.status = 400;
      return;
    }
    
    await EventosCollection.updateMany(
      {_id: new ObjectId(id)},
      {
        $set: {
          id: new ObjectId(id),
          titulo: titulo,
          descripcion: descripcion || eventoEncontrado.descripcion,
          fecha: fecha,
          inicio: inicio,
          fin: fin,
          invitados: invitados,
        }
      }
    );

    context.response.body = {
      _id: id,
      titulo: titulo,
      fecha: fecha,
      inicio: inicio,
      fin: fin,
      invitados: invitados,
      descripcion: descripcion || eventoEncontrado.descripcion
    };
    context.response.status = 200;
    return;


    /*const eventoComprobarSolapamiento = await EventosCollection.findOne({
      $and: [ {fecha: fecha},]
    });

    if (eventoComprobarSolapamiento) {
      context.response.body = { msg: "Solapamiento de eventos", };
      context.response.status = 400;
      return;
    }*/

    

  }

  catch(error) {
    console.log(error);
    context.response.status = 500;
  }
}


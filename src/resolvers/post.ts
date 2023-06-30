import { getQuery } from "oak/helpers.ts";
import { Database, ObjectId } from "mongo";
import { RouterContext } from "oak/router.ts";
import { EventosCollection } from "../db/dbconnection.ts";

type PostEventContext = RouterContext<
  "/addEvent",
  Record<string | number, string | undefined>,
  Record<string, any>
>;


export const postEvent = async (context: PostEventContext) => {
  try {
    
    const params = context.request.body({ type: "json" });
    const value = await params.value;

    if (!value.titulo || !value.fecha || !value.inicio || !value.fin || !value.invitados) {
      context.response.body = { msg: "Falta algun parametro de estos {titulo, fecha, inicio, fin, invitados} ", };
      context.response.status = 400;
      return;
    }
    const { titulo, descripcion, fecha, inicio, fin, invitados } = value;
    

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

    if (typeof fecha !== "string") {
      context.response.body = { msg: "La campo fecha no es de tipo string", };
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

    

    const eventoComprobarSolapamiento = await EventosCollection.findOne({
      fecha: new Date(fecha),
      $or: [
        { inicio: { $gt: inicio, $lt: fin } },
        { fin: { $gt: inicio, $lt: fin } },
      ],
    });

    if (eventoComprobarSolapamiento) {
      context.response.body = { msg: "Solapamiento de eventos", };
      context.response.status = 400;
      return;
    }
    

    

    const addEvent: ObjectId = await EventosCollection.insertOne({
      titulo: titulo,
      fecha: new Date(fecha),
      inicio: inicio,
      fin: fin,
      invitados: invitados,
      descripcion: descripcion || ""
    });

    context.response.body = {
      _id: addEvent,
      titulo: titulo,
      fecha: new Date(fecha),
      inicio: inicio,
      fin: fin,
      invitados: invitados,
      descripcion: descripcion || ""
    };
    context.response.status = 200;
    return;


  }

  catch(error) {
    console.log(error);
    context.response.status = 500;
  }
}

/*
Si hay un evento que se solape ese día (ojo, solapar no es que coincidan las horas, sino que haya solape temporal) se debe devolver un error con status: 400
Si el evento se añade correctamente se debe devolver los datos del evento (incluyendo el id creado en Mongo) con status 200
*/

export type Evento = {
    id: string;
    titulo: string;
    descripcion?: string;
    fecha: Date;
    inicio: number;
    fin: number;
    invitados: string[]
};


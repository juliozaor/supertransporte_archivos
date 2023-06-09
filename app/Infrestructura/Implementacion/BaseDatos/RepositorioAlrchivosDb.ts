
import { RepositorioArchivos } from "../../../Dominio/Repositorios/RepositorioArchivos";
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import fs from "fs";
import { TblArchivosTemporales } from "App/Infrestructura/datos/entidades/Archivo";
import { Archivo } from "App/Dominio/Datos/Entidades/Archivo";

export class RepositorioArchivosDb implements RepositorioArchivos {

    async crearArchivo(archivo: MultipartFileContract, datos: string): Promise<any> {
        const { idPregunta = '', idVigilado, temporal = false, rutaRaiz = 'temp' } = JSON.parse(datos);

        if(!idVigilado) {
            return {
                mensaje: `El campo idVigilado es obligatorio`,
                error: 4
            }
        }
        const basePath = `./files`;

        const { ruta, fecha } = this.crearCarpetaSiNoExiste(basePath, rutaRaiz);
        const nombreAlmacenado = `${idPregunta}_${idVigilado}_${fecha}.${archivo.extname}`
        const nombreOriginalArchivo = archivo.clientName;
        let idTemporal;

        if (temporal) {

            const archivosTemporalesBd = await TblArchivosTemporales.query().where({ 'art_pregunta_id': idPregunta, 'art_usuario_id': idVigilado }).first()

            const data: Archivo = {
                preguntaId: idPregunta,
                usuarioId: idVigilado,
                nombreOriginal: nombreOriginalArchivo,
                nombreArchivo: nombreAlmacenado,
                rutaArchivo: ruta
            }

            if (!archivosTemporalesBd) {

                const archivosTemporales = new TblArchivosTemporales()
                archivosTemporales.establecerArchivo(data)
                idTemporal = (await archivosTemporales.save()).id

            } else {
                try {
                    fs.unlinkSync(`${basePath}${archivosTemporalesBd.rutaArchivo}/${archivosTemporalesBd.nombreArchivo}`)
                } catch (err) {
                    console.error('no se encontro el archivo a eliminar', err)
                }

                archivosTemporalesBd.establecerArchivoConID(data)
                idTemporal = (await archivosTemporalesBd.save()).id

            }
        }

        await archivo?.moveToDisk(`${ruta}`, {
            name: nombreAlmacenado
        })

        return { nombreAlmacenado, nombreOriginalArchivo, ruta, idTemporal }

    }

    verificarCarpetaExiste = (rutaCarpeta) => {
        return fs.existsSync(rutaCarpeta);
    }

    crearCarpetaSiNoExiste = (basePath, rutaRaiz) => {

        const fechaCargue = new Date();
        const { year, month, fecha } = this.format(fechaCargue);

        const ruta = `/${rutaRaiz}/${year}/${month}`
        const raiz = `${basePath}/${rutaRaiz}`
        const rutaAnio = `${raiz}/${year}`;
        const rutaMes = `${rutaAnio}/${month}`;

        if (!this.verificarCarpetaExiste(raiz)) {
            fs.mkdirSync(raiz);
            fs.mkdirSync(rutaAnio);
            fs.mkdirSync(rutaMes);
        }
        if (!this.verificarCarpetaExiste(rutaAnio)) {
            fs.mkdirSync(rutaAnio);
            fs.mkdirSync(rutaMes);
        }
        if (!this.verificarCarpetaExiste(rutaMes)) {
            fs.mkdirSync(rutaMes);
        }

        return { ruta, fecha };
    }

    format(inputDate: Date) {
        let date, month, year, hour, minute, second;

        year = inputDate.getFullYear();
        month = inputDate.getMonth() + 1;
        date = inputDate.getDate();
        hour = inputDate.getHours();
        minute = inputDate.getMinutes();
        second = inputDate.getSeconds();

        month = month.toString().padStart(2, '0');
        date = date.toString().padStart(2, '0');
        hour = hour.toString().padStart(2, '0');
        minute = minute.toString().padStart(2, '0');
        second = second.toString().padStart(2, '0');

        return {
            year,
            month,
            fecha: `${year}${month}${date}${hour}${minute}${second}`
        }
    }


    async obtenerArchivo(datos: string): Promise<any> {
        const { nombre, ruta } = JSON.parse(datos);
        if (!nombre || !ruta) {
            return {
                mensaje: `Los parametros ruta y nombre son obligatorios`,
                error: 5
            }
        }
        const basePath = `./files`;

        try {
            let archivo = fs.readFileSync(`${basePath}${ruta}/${nombre}`, 'base64');
            return {archivo}
        } catch (error) {
            return {
                mensaje: `No se encontro el archivo solicitado`,
                error: 6
            }

        }

    }



}


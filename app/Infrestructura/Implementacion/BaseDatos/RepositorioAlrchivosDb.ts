
import { RepositorioArchivos } from "../../../Dominio/Repositorios/RepositorioArchivos";
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import fs from "fs";
import { TblArchivosTemporales } from "App/Infrestructura/datos/entidades/Archivo";

export class RepositorioArchivosDb implements RepositorioArchivos {

    async crearArchivo(archivo: MultipartFileContract, datos: string): Promise<any> {
        const { idPregunta, idVigilado, temporal = false, rutaRaiz = 'temp' } = JSON.parse(datos);
        const basePath = `./files`;
        console.log(temporal); //no guardar en la tabla temporal cuando es false

        const { ruta, fecha } = this.crearCarpetaSiNoExiste(basePath, rutaRaiz);
        const nombreAlmacenado = `${idPregunta}_${idVigilado}_${fecha}.${archivo.extname}`
        const nombreOriginalArchivo = archivo.clientName;
        let idTemporal;


        const archivosTemporalesBd = await TblArchivosTemporales.query().where({ 'art_pregunta_id': idPregunta, 'art_usuario_id': idVigilado }).first()
        if (!archivosTemporalesBd) {
            const archivosTemporales = new TblArchivosTemporales()
            archivosTemporales.preguntaId = idPregunta
            archivosTemporales.usuarioId = idVigilado
            archivosTemporales.nombreOriginal = nombreOriginalArchivo
            archivosTemporales.nombreArchivo = nombreAlmacenado
            archivosTemporales.rutaArchivo = ruta
            idTemporal = (await archivosTemporales.save()).id

            await archivo?.moveToDisk(`${ruta}`, {
                name: nombreAlmacenado
            })

        } else {
            try {
                fs.unlinkSync(`${basePath}${archivosTemporalesBd.rutaArchivo}/${archivosTemporalesBd.nombreArchivo}`)
                console.log('File removed')
            } catch (err) {
                console.error('Something wrong happened removing the file', err)
            }

            archivosTemporalesBd.nombreOriginal = nombreOriginalArchivo
            archivosTemporalesBd.nombreArchivo = nombreAlmacenado
            archivosTemporalesBd.rutaArchivo = ruta
            idTemporal = (await archivosTemporalesBd.save()).id

            //actualizar el acrchivo
            await archivo?.moveToDisk(`${ruta}`, {
                name: nombreAlmacenado
            })


        }



        return { nombreAlmacenado, nombreOriginalArchivo, ruta, idTemporal }

    }

    verificarCarpetaExiste = (rutaCarpeta) => {
        return fs.existsSync(rutaCarpeta);
    }

    crearCarpetaSiNoExiste = (basePath, rutaRaiz) => {

        const fechaCargue = new Date();
        const year = fechaCargue.getFullYear();
        const month = fechaCargue.getMonth() + 1;
        const fecha = this.format(fechaCargue);

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

        date = inputDate.getDate();
        month = inputDate.getMonth() + 1;
        year = inputDate.getFullYear();
        hour = inputDate.getHours();
        minute = inputDate.getMinutes();
        second = inputDate.getSeconds();

        date = date.toString().padStart(2, '0');
        month = month.toString().padStart(2, '0');
        hour = hour.toString().padStart(2, '0');
        minute = minute.toString().padStart(2, '0');
        second = second.toString().padStart(2, '0');

        return `${year}${month}${date}${hour}${minute}${second}`;
    }



}


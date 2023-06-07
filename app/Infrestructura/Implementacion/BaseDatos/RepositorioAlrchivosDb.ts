
import { RepositorioArchivos } from "../../../Dominio/Repositorios/RepositorioArchivos";
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import fs from "fs";
import { TblArchivosTemporales } from "App/Infrestructura/datos/entidades/Archivo";

export class RepositorioArchivosDb implements RepositorioArchivos {

    async crearArchivo(archivo: MultipartFileContract, datos: string): Promise<any> {
        const basePath = './files';
        const { idPregunta, idVigilado, temporal = true } = JSON.parse(datos);

        //Parametro Temporal true



        const { ruta, fecha } = this.crearCarpetaSiNoExiste(basePath);
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
              } catch(err) {
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

    crearCarpetaSiNoExiste = (basePath) => {
        
        const fechaCargue = new Date();
        const year = fechaCargue.getFullYear();
        const month = fechaCargue.getMonth() + 1;
        const fecha = this.format(fechaCargue);

        const rutaCarpeta = `${basePath}/${year}/${month}`;
        const ruta = `/${year}/${month}`

        if (!this.verificarCarpetaExiste(rutaCarpeta)) {
            const rutaAnio = `${basePath}/${year}`;
            if (!this.verificarCarpetaExiste(rutaAnio)) {
                fs.mkdirSync(rutaAnio);
                fs.mkdirSync(rutaCarpeta);
                console.log('La carpeta ha sido creada. año mes')
            } else {
                fs.mkdirSync(rutaCarpeta);
                console.log('La carpeta ha sido creada. solo mes')
            }
        } else {
            console.log('La carpeta ya existe.')
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


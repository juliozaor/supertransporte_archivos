
import { RepositorioArchivos } from "../../../Dominio/Repositorios/RepositorioArchivos";
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import fs from "fs";
import { TblArchivosTemporales } from "App/Infrestructura/datos/entidades/Archivo";
import { Archivo } from "App/Dominio/Datos/Entidades/Archivo";
import Database from "@ioc:Adonis/Lucid/Database";
const path = require('path');

export class RepositorioArchivosDb implements RepositorioArchivos {

    async crearArchivo(archivo: MultipartFileContract, datos: string): Promise<any> {
        const { idPregunta = '', idVigilado, temporal = false, rutaRaiz = 'temp' } = JSON.parse(datos);

        if (!idVigilado) {
            return {
                mensaje: `El campo idVigilado es obligatorio`,
                error: 4
            }
        }
        //const basePath = `./archivos`; // local
        const basePath = `../../archivos`; // desplegado
        // const basePath = `/bodegapesv`; // desplegado
        /* 
        
                
                const basePath = `${Env.get('HOST')}:${Env.get('PORT')}/archivos`;
                console.log(basePath);
        
                const relativePath = './archivos'; */

        const { ruta, fecha } = await this.crearCarpetaSiNoExiste(basePath, rutaRaiz, idVigilado);
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
                    const absolutePath = path.resolve(`${basePath}${archivosTemporalesBd.rutaArchivo}/${archivosTemporalesBd.nombreArchivo}`);
                    fs.unlinkSync(`${absolutePath}`)
                } catch (err) {
                    console.error('no se encontro el archivo a eliminar', err)
                }

                archivosTemporalesBd.establecerArchivoConID(data)
                idTemporal = (await archivosTemporalesBd.save()).id

            }
        }

        const absolutePathCreate = path.resolve(`${basePath}/${ruta}/${nombreAlmacenado}`)

        fs.copyFile(archivo.tmpPath!, absolutePathCreate, (err) => {
            if (err) {
                console.error('Error al guardar el archivo:', err);
            } else {
                console.log('Archivo guardado con éxito.');
                fs.unlinkSync(`${archivo.tmpPath!}`)
            }
        });

        return { nombreAlmacenado, nombreOriginalArchivo, ruta, idTemporal }

    }

    verificarCarpetaExiste = (rutaCarpeta) => {
        return fs.existsSync(rutaCarpeta);
    }

    crearCarpetaSiNoExiste = async (basePath, rutaRaiz, idVigilado) => {

        const fechaCargue = new Date();
        const { fecha } = this.format(fechaCargue);

     const ruta = `${rutaRaiz}/${idVigilado}`
        const rutaSistema = `${basePath}/${rutaRaiz}`
        const raiz = `${rutaSistema}/${idVigilado}`

        const absolutePathCreateRuta = path.resolve(`${rutaSistema}`)
        const absolutePathCreateFull = path.resolve(`${raiz}`)
        /*  const rutaAnio = `${raiz}/${year}`;
         const rutaMes = `${rutaAnio}/${month}`;
  */
        if (!this.verificarCarpetaExiste(absolutePathCreateRuta)) {
            fs.mkdirSync(absolutePathCreateRuta);
            fs.mkdirSync(absolutePathCreateFull);
        }
        if (!this.verificarCarpetaExiste(absolutePathCreateFull)) {
            fs.mkdirSync(absolutePathCreateFull);
        }
        /*  if (!this.verificarCarpetaExiste(rutaAnio)) {
             fs.mkdirSync(rutaAnio);
             fs.mkdirSync(rutaMes);
         }
         if (!this.verificarCarpetaExiste(rutaMes)) {
             fs.mkdirSync(rutaMes);
         }
  */
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
        // const relativePath = `./archivos`; // local
        const relativePath = '../../archivos'; // desplegado
        //const relativePath = `/bodegapesv`

        try {
            const absolutePath = path.resolve(`${relativePath}${ruta}/${nombre}`);

            let archivo = fs.readFileSync(`${absolutePath}`, 'base64');
            return { archivo }
        } catch (error) {
            return {
                mensaje: `No se encontro el archivo solicitado`,
                error: 6
            }

        }

    }

    verificarDirectorios = async () => {

        const sql = 'select distinct usuario_actualizacion from respuestas where ruta is not null '
        const consulta = await Database.rawQuery(sql)

        const basePath = `../../archivos`;
        let carpetas = new Array();
        consulta.rows.forEach(element => {        

              const raiz = path.resolve(`${basePath}/pesv/${element.usuario_actualizacion}`)
              console.log(raiz);
              
            if (!this.verificarCarpetaExiste(raiz)) {
                carpetas.push(element.usuario_actualizacion)
            }
        });
        return carpetas;
    }




}


import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ArchivosTemporales extends BaseSchema {
  protected tableName = 'tbl_archivos_temporales'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('art_id')
      table.integer('art_pregunta_id')
      table.string('art_usuario_id')
      table.string('art_nombre_archivo', 100)
      table.string('art_ruta_archivo', 200)
      table.string('art_nombre_original', 200)
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

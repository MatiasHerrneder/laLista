from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from enum import Enum
import datetime

app = Flask(__name__) 

#parametros login
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'lalistauser'
app.config['MYSQL_PASSWORD'] = 'lanuevacontraseniaop'
app.config['MYSQL_DB'] = 'lalista'
#db
mysql = MySQL(app)

#constantes
CANT_TAREAS_PAG_PRINCIPAL = 5
#FORMATO_FECHAS = "%Y/%m/%d"
FORMATO_FECHAS = "%d/%m/%Y"

#Enumerados
class Estados(Enum):
    ALCANZADO = 'Alcanzado'
    EN_PROCESO = 'En Proceso'
    NO_ALCANZADO = 'No Alcanzado'

class Plazo(Enum):
    #Completado de querys
    CORTO = 1
    MEDIANO = 2
    LARGO = 3
    def getPlazo(p):
        if p == Plazo.CORTO: return ' DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) <= 31'
        elif p == Plazo.MEDIANO: return ' DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) > 31 and DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) <= 365'
        elif p == Plazo.LARGO: return ' DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) > 365'
        else: return ''

class Expiracion(Enum):
    TODAS = 0
    EXPIRADAS = 1
    NO_EXPIRADAS = 2
    POR_EXPIRAR = 3
    def getExpiracion(e):
        if e == Expiracion.EXPIRADAS: return ' DATEDIFF(fecha_de_culminacion, CURDATE()) < 0'
        elif e == Expiracion.NO_EXPIRADAS: return ' DATEDIFF(fecha_de_culminacion, CURDATE()) >= 0'
        elif e == Expiracion.POR_EXPIRAR: return ' DATEDIFF(fecha_de_culminacion, CURDATE()) <= 30 and' + Expiracion.getExpiracion(Expiracion.NO_EXPIRADAS)
        else: return ''


@app.route('/') 
def cargarIndex():
    return render_template('/index.html', 
                            tareasPorVencer = getTareas(Estados.EN_PROCESO, expirada= Expiracion.POR_EXPIRAR), 
                            tareasCortoPlazo = getTareas(Estados.EN_PROCESO, cantidad= CANT_TAREAS_PAG_PRINCIPAL, plazo= Plazo.CORTO, expirada= Expiracion.NO_EXPIRADAS), 
                            tareasMedianoPlazo = getTareas(Estados.EN_PROCESO, cantidad= CANT_TAREAS_PAG_PRINCIPAL, plazo= Plazo.MEDIANO, expirada= Expiracion.NO_EXPIRADAS), 
                            tareasLargoPlazo = getTareas(Estados.EN_PROCESO, cantidad= CANT_TAREAS_PAG_PRINCIPAL, plazo= Plazo.LARGO, expirada= Expiracion.NO_EXPIRADAS),
                            tareasExpiradas = getTareas(estado= Estados.EN_PROCESO, cantidad= CANT_TAREAS_PAG_PRINCIPAL, expirada= Expiracion.EXPIRADAS)) 

# @app.route('/porVencer') 
# def cargarPorVencer():
#     return render_template('/todasLasTareas.html', tareas = getTareas(Estados.EN_PROCESO), nombre = 'Por vencer')

@app.route('/cortoPlazo') 
def cargarCortoPlazo():
    return render_template('/todasLasTareas.html',
                           expiradas = getTareas(plazo= Plazo.CORTO, estado= Estados.EN_PROCESO, expirada= Expiracion.EXPIRADAS),
                           enProceso = getTareas(plazo= Plazo.CORTO, estado= Estados.EN_PROCESO, expirada= Expiracion.NO_EXPIRADAS),
                           alcanzadas = getTareas(plazo= Plazo.CORTO, estado= Estados.ALCANZADO),
                           noAlcanzadas = getTareas(plazo= Plazo.CORTO, estado= Estados.NO_ALCANZADO),
                           nombre = 'Corto plazo')

@app.route('/medianoPlazo') 
def cargarMedianoPlazo():
    return render_template('/todasLasTareas.html',
                           expiradas = getTareas(plazo= Plazo.MEDIANO, estado= Estados.EN_PROCESO, expirada= Expiracion.EXPIRADAS),
                           enProceso = getTareas(plazo= Plazo.MEDIANO, estado= Estados.EN_PROCESO, expirada= Expiracion.NO_EXPIRADAS),
                           alcanzadas = getTareas(plazo= Plazo.MEDIANO, estado= Estados.ALCANZADO),
                           noAlcanzadas = getTareas(plazo= Plazo.MEDIANO, estado= Estados.NO_ALCANZADO),
                           nombre = 'Mediano plazo')

@app.route('/largoPlazo') 
def cargarLargoPlazo():
    return render_template('/todasLasTareas.html',
                           expiradas = getTareas(plazo= Plazo.LARGO, estado= Estados.EN_PROCESO, expirada= Expiracion.EXPIRADAS),
                           enProceso = getTareas(plazo= Plazo.LARGO, estado= Estados.EN_PROCESO, expirada= Expiracion.NO_EXPIRADAS),
                           alcanzadas = getTareas(plazo= Plazo.LARGO, estado= Estados.ALCANZADO),
                           noAlcanzadas = getTareas(plazo= Plazo.LARGO, estado= Estados.NO_ALCANZADO),
                           nombre = 'Largo plazo')

@app.route('/cargarTarea')
def cargarTareas():
    return render_template('/cargarTarea.html')

@app.route('/scheduler')
def scheduler():
    return render_template('/scheduler.html',
                           tareasRepetitivas = getTareasRepetitivas())

# @app.route('/expiradas') 
# def cargarExpiradas():
#     return render_template('/todasLasTareas.html', tareas = getTareas(estado= Estados.EN_PROCESO, expirada= Expiracion.EXPIRADAS), nombre = 'Expiradas')

@app.route("/api/query", methods=["POST"])
def query():
    data = request.get_json()
    value = data.get("value")

    cursor = mysql.connection.cursor()

    query = "SELECT nombre, descripcion, estado, fecha_de_propuesta, fecha_de_culminacion, DATEDIFF(fecha_de_culminacion, CURDATE()), DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) FROM tarea WHERE id = %s"
    cursor.execute(query, (value,))
    result = cursor.fetchall()
    cursor.close()
    #edito formato de fechas
        #print(result)
    list_result = list(result[0])
        #print(list_result)
    list_result[3] = list_result[3].strftime(FORMATO_FECHAS)
    list_result[4] = list_result[4].strftime(FORMATO_FECHAS)
        #print(list_result)
    result = (tuple(list_result), )
        #print(result)
    return jsonify(result)

@app.route("/update-tarea", methods=["PUT"])
def updateTarea():
    data = request.get_json()
    id = data['id']
    descripcion = data['descripcion'] 
    estado = data['estado']
    fechaDePropuesta = data['fechaDePropuesta']
    fechaDeCulminacion = data['fechaDeCulminacion']
    query = "UPDATE tarea SET descripcion = %s, estado = %s, fecha_de_propuesta = %s, fecha_de_culminacion = %s WHERE id = %s"
    context_data = (descripcion, estado, fechaDePropuesta, fechaDeCulminacion, id)
    cursor = mysql.connection.cursor()
    cursor.execute(query, context_data)
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Tarea actualizada'})

@app.route("/delete/<id>", methods=["DELETE"])
def delete_row(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM tarea WHERE id = %s", [id])
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Tarea borrada   '})

@app.route("/insert-tarea", methods=["POST"])
def insertTarea():
    data = request.get_json()
    nombre = data['nombre']
    descripcion = data['descripcion']
    fechaDeCulminacion = data['fechaDeCulminacion']
    query = "insert into tarea (nombre, descripcion, fecha_de_culminacion"
    contextData = (nombre, descripcion, fechaDeCulminacion, )
    if 'fechaDePropuesta' in data: 
        query = query + ", fecha_de_propuesta"
        contextData = contextData + (data['fechaDePropuesta'], )
    if 'estado' in data: 
        query = query + ", estado"
        contextData = contextData + (data['estado'], )
    query = query + ") values(" + ("%s," * (len(contextData)-1)) + "%s)"
    cursor = mysql.connection.cursor()
    cursor.execute(query, contextData)
    mysql.connection.commit()
    cursor.close()
    print('VALIDAR')
    return jsonify({'message': 'Tarea agregada'})

@app.route("/insert-tareaRepetitiva", methods=["POST"])
def insertTareaRepetitiva():
    data = request.get_json()
    query = "insert into tareaRepetitiva (nombre, descripcion, temporalidad, unidad_de_temporalidad, plazo, unidad_de_plazo, fecha_de_primer_tarea) values (%s, %s, %s, %s, %s, %s, %s)"
    contextData = (data['nombre'], data['descripcion'], data['repetirCada'], data['unidadRepetirCada'], data['plazo'], data['unidadPlazo'], data['fechaDePrimerTarea'], )
    cursor = mysql.connection.cursor()
    cursor.execute(query, contextData)
    mysql.connection.commit()
    cursor.close()
    print('VALIDAR')
    return jsonify({'message': 'Tarea repetitiva agregada'})


def getTareas(estado = 0, cantidad = 0, plazo = 0, expirada = 0):
    cursor = mysql.connection.cursor()
    context_data = ()
    if cantidad < 0: cantidad = 0 
    if expirada == Expiracion.EXPIRADAS: query = "SELECT id, nombre, DATEDIFF(CURDATE(), fecha_de_culminacion), fecha_de_culminacion, DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) from tarea"
    else: query = "SELECT id, nombre, DATEDIFF(fecha_de_culminacion, CURDATE()), fecha_de_culminacion, DATEDIFF(fecha_de_culminacion, fecha_de_propuesta) from tarea"
    if estado != 0 or plazo != 0: query = query + " where"
    if estado != 0:
        query = query + " estado = %s"
        context_data = context_data + (estado.value, )
    if plazo != 0:
        if estado != 0: query = query + " and"
        query = query + Plazo.getPlazo(plazo)
    if expirada != 0:
        if estado != 0 or plazo != 0: query = query + " and"
        query = query + Expiracion.getExpiracion(expirada)
    if expirada == Expiracion.EXPIRADAS: query = query + " ORDER BY fecha_de_culminacion DESC"
    else: query = query + " ORDER BY fecha_de_culminacion ASC"
    if cantidad != 0:
        query = query + " LIMIT %s"
        context_data = context_data + (cantidad, )
    cursor.execute(query, context_data)
    row_headers=[x[0] for x in cursor.description] #this will extract row headers
    rv = cursor.fetchall()
    json_data=[]
    for result in rv:
        list_result = list(result)
        list_result[3] = list_result[3].strftime(FORMATO_FECHAS)
        result = tuple(list_result)
        json_data.append(dict(zip(row_headers,result)))
    cursor.close()
    return json_data    

def getTareasRepetitivas():
    query = "SELECT id, nombre, temporalidad, unidad_de_temporalidad, plazo, unidad_de_plazo, fecha_de_primer_tarea, fecha_de_ultima_creada FROM tareaRepetitiva ORDER BY temporalidad ASC, unidad_de_temporalidad ASC;"
    cursor = mysql.connection.cursor()
    cursor.execute(query)
    rv = cursor.fetchall()
    json_data=[]
    row_headers=[x[0] for x in cursor.description] #this will extract row headers
    for result in rv:
        #formato de fecha
        list_result = list(result)
        list_result[2] = str(list_result[3]) + ' ' + (list_result[2] if list_result[3] > 1 else list_result[2][:-2] if list_result[3] == 'meses' else list_result[2][:-1])
        list_result[3] = str(list_result[5]) + ' ' + (list_result[4] if list_result[5] > 1 else list_result[4][:-2] if list_result[5] == 'meses' else list_result[4][:-1])
        list_result[4] = list_result[6].strftime(FORMATO_FECHAS)
        list_result[5] = list_result[7].strftime(FORMATO_FECHAS)
        result = tuple(list_result[:-2])
        #crea json
        json_data.append(dict(zip(row_headers,result)))
    cursor.close()
    return json_data

if __name__ == '__main__': 
    app.run(debug=True) 
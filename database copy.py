###REINICIAR LA MAQUINA PARA VER SI ANDA EL IMPORT


#!/usr/bin/python
import MySQLdb

# Connect
db = MySQLdb.connect(host="localhost",
                    user="lalistauser",
                    passwd="lanuevacontraseniaop",
                    db="lalista")

cursor = db.cursor()

# Execute SQL select statement
cursor.execute("SELECT * FROM tarea")

# Commit your changes if writing
# In this case, we are only reading data
# db.commit()

# Get the number of rows in the resultset
numrows = cursor.rowcount

# Get and display one row at a time
for x in range(0, numrows):
    row = cursor.fetchone()
    print(row[0], "-->", row[1], row[2])

# Close the connection
db.close()
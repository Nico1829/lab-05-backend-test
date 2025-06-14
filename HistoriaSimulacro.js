/*Happy Path:

Responder pregunta y avanzar
Dado que el usuario ve una pregunta activa y selecciona una respuesta,
cuando hace clic en “Responder”,
entonces se envía su respuesta al backend y se carga la siguiente pregunta.
*/

//SimulacroController
const responder = (req, res) => {
  const { userId } = req.params;
  const { respuesta } = req.body;
  const sesion = manager.get(userId);
  if (!sesion) return res.status(404).json({ error: 'No hay simulacro activo' });
  if (sesion.terminado()) return res.status(400).json({ error: 'El simulacro ya ha finalizado' });
}

//SimulacroManager
  responder(respuesta) {
      const actual = this.preguntas[this.indice];
      if (!actual) return;
      if (respuesta === actual.correct) this.correctas++;
      this.indice++; };
  

/*
Finaliza simulacro y ve resultados 
Dado que el usuario ha respondido todas las preguntas,
 cuando llega al final del simulacro,
  entonces puede hacer clic en “Ver resultados” y
 se actualizan sus monedas y experiencia.
*/
//SimulacroController
const verResultados = async (req, res) => {
  const { userId } = req.params;
  const sesion = manager.get(userId);
  if (!sesion) return res.status(404).json({ error: 'No hay simulacro activo' });

  const resultado = sesion.resultados();
  const tema = sesion.tema || 'desconocido';

  const reporte = new Reporte(userId, tema, resultado.correctas, resultado.total);
  const experienciaGanada = resultado.correctas * 20;
  const monedasGanadas = resultado.correctas * 50;

  try {
    const guardado = await reporte.guardarEnDB(db);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE usuarios SET experiencia = experiencia + ?, monedas = monedas + ? WHERE id = ?`,
        [experienciaGanada, monedasGanadas, userId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  
    res.json({
      mensaje: 'Simulacro finalizado',
      total: resultado.total,
      correctas: resultado.correctas,
      incorrectas: resultado.incorrectas,
      experienciaGanada,
      monedasGanadas,
      guardado
    });}

}



 //Unhappy Path 
 /*
No selecciona tema
Dado que el usuario no ha elegido ningún tema,
cuando hace clic en “Iniciar Simulacro”
entonces aparece un mensaje de alerta: "Por favor selecciona un tema"
y el simulacro no inicia.

*/
//SimulacroController
const iniciarSimulacro = (req, res) => {
  const { userId, tema } = req.body;
  const sesion = manager.iniciar(userId, tema);
  if (!sesion) return res.status(404).json({ error: 'Tema no válido' });
  res.json({ mensaje: 'Simulacro iniciado', total: sesion.preguntas.length });
};

//SimulacroManager
const iniciar = (userId, tema) => {
  if (!preguntasPorTema[tema]) return null;

};

/*
Intenta responder sin seleccionar una opción 
Dado que el usuario no ha seleccionado ninguna respuesta, 
cuando hace clic en “Responder”, 
entonces se muestra una alerta: 
"Selecciona una respuesta" y no se avanza.
*/

//SimulacroController
const responder = (req, res) => {
  const { userId } = req.params;
  const { respuesta } = req.body;

  if (respuesta === undefined || respuesta === null || respuesta === '') {
    return res.status(400).json({ error: 'Selecciona una respuesta' });
  }

  const sesion = manager.get(userId);
  if (!sesion) return res.status(404).json({ error: 'No hay simulacro activo' });
  if (sesion.terminado()) return res.status(400).json({ error: 'El simulacro ya ha finalizado' });
  sesion.responder(respuesta);
  res.json({ mensaje: 'Respuesta registrada' });
};
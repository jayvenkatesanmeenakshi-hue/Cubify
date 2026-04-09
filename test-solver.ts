import Cube from 'cubejs';
try {
  Cube.initSolver();
  const cube = new Cube();
  cube.move("R U R' U'");
  console.log("Solution:", cube.solve());
} catch (e) {
  console.error("Error:", e);
}

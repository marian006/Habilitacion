// index.js
// Archivo principal que maneja la lógica del sistema de la aerolínea
const Avion = require('./models/Avion');
const Vuelo = require('./models/Vuelo');
const Pasajero = require('./models/Pasajero');
const Equipaje = require('./models/Equipaje');
const Mascota = require('./models/Mascota');
const { preguntar, cerrar } = require('./utils/input');

(async () => {
  // Crear un nuevo avión
  const aviones = new Avion("Boeing 747");

  // Solicitar el porcentaje de descuento para pasajeros VIP
  const descuentoVIP = parseFloat(await preguntar("Ingrese el descuento para pasajeros VIP (en %): "));
  // Solicitar el peso límite de equipaje
  const pesoLimite = parseFloat(await preguntar("Ingrese el peso límite de equipaje (en kg): "));
  // Solicitar el costo adicional por transportar un perro
  const costoPerro = parseFloat(await preguntar("Ingrese el costo adicional por transportar un perro: "));
  // Calcular el costo adicional por transportar un gato
  const costoGato = costoPerro - 5000;

  // Solicitar el número de vuelos
  const numeroVuelos = parseInt(await preguntar("¿Cuántos vuelos desea ingresar? "));
  for (let i = 0; i < numeroVuelos; i++) {
    const numeroVuelo = await preguntar(`Ingrese el número del vuelo ${i + 1}: `);
    const distanciaVuelo = parseInt(await preguntar(`Ingrese la distancia del vuelo ${i + 1} (en km): `));
    const vuelo = new Vuelo(numeroVuelo, distanciaVuelo);

    // Solicitar el número de pasajeros
    const numeroPasajeros = parseInt(await preguntar("¿Cuántos pasajeros desea ingresar? "));
    for (let j = 0; j < numeroPasajeros; j++) {
      const nombrePasajero = await preguntar(`Ingrese el nombre del pasajero ${j + 1}: `);
      const vip = (await preguntar(`¿Es el pasajero ${j + 1} VIP? (si/no): `)).toLowerCase() === 'si';
      const tarifa = parseFloat(await preguntar(`Ingrese la tarifa del pasajero ${j + 1}: `));
      const pasajero = new Pasajero(nombrePasajero, vip, tarifa);

      // Solicitar el número de equipajes
      const numeroEquipajes = parseInt(await preguntar("¿Cuántos equipajes desea ingresar (máximo 4)? "));
      for (let k = 0; k < numeroEquipajes; k++) {
        const pesoEquipaje = parseFloat(await preguntar(`Ingrese el peso del equipaje ${k + 1}: `));
        const equipaje = new Equipaje(pesoEquipaje);
        pasajero.agregarEquipaje(equipaje);
      }

      // Preguntar si el pasajero tiene mascota
      const tieneMascota = (await preguntar("¿El pasajero tiene mascota? (si/no): ")).toLowerCase() === 'si';
      if (tieneMascota) {
        const tipoMascota = await preguntar("¿Qué tipo de mascota tiene? (perro/gato): ");
        const costoMascota = tipoMascota === 'perro' ? costoPerro : costoGato;
        const mascota = new Mascota(tipoMascota, costoMascota);
        pasajero.agregarMascota(mascota);
      }

      // Agregar pasajero al vuelo
      vuelo.agregarPasajero(pasajero);
    }

    // Agregar vuelo al avión
    aviones.agregarVuelo(vuelo);
  }

  // Cerrar la interfaz de entrada de datos
  cerrar();

  // Variables para almacenar los resultados
  let totalRecaudado = 0;
  let totalDescuentos = 0;
  let totalSobrepeso = 0;
  let totalMascotasPerros = 0;
  let totalMascotasGatos = 0;
  let totalImpuestos = 0;

  let vueloMayorCosto = null;
  let mayorCosto = 0;

  // Recorrer los vuelos
  let actualVuelo = aviones.vuelos.cabeza;
  while (actualVuelo) {
    let actualPasajero = actualVuelo.valor.pasajeros.cabeza;
    let costoVuelo = 0;

    // Recorrer los pasajeros
    while (actualPasajero) {
      const pasajero = actualPasajero.valor;
      const costo = pasajero.calcularCosto(descuentoVIP, pesoLimite, costoPerro, costoGato);
      totalRecaudado += costo;

      if (pasajero.vip) {
        totalDescuentos += (descuentoVIP / 100) * pasajero.tarifa;
      }

      // Recorrer los equipajes
      let actualEquipaje = pasajero.equipajes.cabeza;
      while (actualEquipaje) {
        if (actualEquipaje.valor.peso > pesoLimite) {
          totalSobrepeso += 50000;
        }
        actualEquipaje = actualEquipaje.siguiente;
      }

      // Recorrer las mascotas
      let actualMascota = pasajero.mascotas.cabeza;
      while (actualMascota) {
        if (actualMascota.valor.tipo === 'perro') {
          totalMascotasPerros += actualMascota.valor.costo;
        } else if (actualMascota.valor.tipo === 'gato') {
          totalMascotasGatos += actualMascota.valor.costo;
        }
        actualMascota = actualMascota.siguiente;
      }

      if (actualVuelo.valor.distancia > 1000) {
        totalImpuestos += (0.10 * pasajero.tarifa);
      }

      costoVuelo += costo;
      actualPasajero = actualPasajero.siguiente;
    }

    if (costoVuelo > mayorCosto) {
      mayorCosto = costoVuelo;
      vueloMayorCosto = actualVuelo.valor.numero;
    }

    actualVuelo = actualVuelo.siguiente;
  }

  // Mostrar los resultados
  console.log("Valor total recaudado por la aerolínea: ", totalRecaudado);
  console.log("Valor total de los descuentos otorgados a los pasajeros VIP: ", totalDescuentos);
  console.log("Número de vuelo que más costos generó por concepto de impuestos: ", vueloMayorCosto);
  console.log("Valor total de dinero recaudado por concepto de sobrepeso en el equipaje: ", totalSobrepeso);
  console.log("Valor total recaudado por concepto de impuestos: ", totalImpuestos);
  console.log("Dinero recogido por mascotas perros: ", totalMascotasPerros);
  console.log("Dinero recogido por mascotas gatos: ", totalMascotasGatos);

  if (totalMascotasPerros > totalMascotasGatos) {
    console.log("Se recogió más dinero por concepto de mascotas perros.");
  } else if (totalMascotasPerros < totalMascotasGatos) {
    console.log("Se recogió más dinero por concepto de mascotas gatos.");
  } else {
    console.log("Se recogió la misma cantidad de dinero por concepto de mascotas perros y gatos.");
  }

})();

import moment from "moment";

// 🔹 Determina la primera fecha de pago según la fecha de solicitud
export const calcularPrimeraFechaPago = (fechaSolicitud) => {
    const fecha = moment(fechaSolicitud);
    const dia = fecha.date();
    const mes = fecha.month() + 1;
    const año = fecha.year();

    let primerPago;

    // Si el día de solicitud es antes o igual al 7 → paga el 15
    if (dia <= 7) {
      primerPago = moment(`${año}-${mes}-15`);
    }
    // Si el día está entre 8 y 21 → paga el 30/31/28 (fin de mes)
    else if (dia <= 21) {
      primerPago = moment(`${año}-${mes}-${getLastDayOfMonth(año, mes)}`);
    }
    // Si el día es después del 21 → pasa al siguiente mes
    else {
      const siguienteMes = fecha.add(1, "month");
      const mesSiguiente = siguienteMes.month() + 1;
      const añoSiguiente = siguienteMes.year();
      primerPago = moment(`${añoSiguiente}-${mesSiguiente}-15`);
    }

    return primerPago;
 };

  // Genera todas las fechas de pago
export const generarFechasPagos = (fechaSolicitud, cantidadPagos) => {
    const fechas = [];
    let fecha = calcularPrimeraFechaPago(fechaSolicitud);

    for (let i = 1; i <= cantidadPagos; i++) {
      fechas.push({
        numPago: i,
        fechaPago: fecha.format("YYYY-MM-DD"),
        pagado: false,
      });

      // alternar entre 15 y fin de mes
      if (fecha.date() === 15) {
        fecha = fecha.clone().endOf("month");
      } else {
        const siguienteMes = fecha.clone().add(1, "month");
        fecha = moment(`${siguienteMes.year()}-${siguienteMes.month() + 1}-15`);
      }
    }

    return fechas;
};
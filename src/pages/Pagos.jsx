import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, increment } from "firebase/firestore";
import { Button, Table, Form } from "react-bootstrap";

export default function Pagos() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    // When date changes we re-subscribe
    let unsub = () => {};
    const q = query(collection(db, "pagos"), where("fechaPago", "==", date), where("pagado", "==", false));
    unsub = onSnapshot(q, snap => {
      setPagos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [date]);

  const marcarPagado = async (pago) => {
    // marcar pago
    await updateDoc(doc(db, "pagos", pago.id), { pagado: true });
    // incrementar conteo en prestamo
    const prestamoRef = doc(db, "prestamos", pago.prestamoId);
    await updateDoc(prestamoRef, { pagosRealizados: increment(1) });

    // verificar si ya se completó el prestamo
    const prestamoSnap = await getDoc(prestamoRef);
    if (prestamoSnap.exists()) {
      const data = prestamoSnap.data();
      if (data.pagosRealizados >= data.pagosTotales) {
        // cerrar préstamo
        await updateDoc(prestamoRef, { activo: false });
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Relación de Pagos</h4>
        <div className="d-flex align-items-center">
          <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 180 }} />
        </div>
      </div>

      <div className="table-responsive-container">
        <Table striped>
          <thead><tr><th>Cliente</th><th>Préstamo</th><th>Pago #</th><th>Fecha</th><th>Monto</th><th>Acción</th></tr></thead>
          <tbody>
          {pagos.map(p => (
            <tr key={p.id}>
              <td>{p.clienteNombre}</td>
              <td>{p.prestamoId}</td>
              <td>{p.numeroPago}</td>
              <td>{p.fechaPago}</td>
              <td>{p.monto}</td>
              <td><Button size="sm" onClick={() => marcarPagado(p)}>Marcar pagado</Button></td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>
    </div>
  );
}

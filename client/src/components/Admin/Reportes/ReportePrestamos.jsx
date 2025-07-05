import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { Page, Text, View, Document, StyleSheet, pdf } from '@react-pdf/renderer';

const API_BASE = 'https://birecam.onrender.com';

const ReportePrestamos = () => {
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/loan/loanreport`);
        setPrestamos(res.data);
      } catch (error) {
        console.error('Error al cargar préstamos:', error);
      }
    };

    fetchPrestamos();
  }, []);

  const formatearFecha = (fecha) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(fecha));
  };

  const generarColores = (cantidad) => {
    const coloresBase = [
      '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#00A6B4', '#A3E1D4', '#F77062', '#8A89A6',
      '#F7C59F', '#F18F01', '#048BA8', '#2E4057', '#99C24D'
    ];

    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(coloresBase[i % coloresBase.length]);
    }
    return colores;
  };

  // --- EXPORTAR A EXCEL ---
  const exportarExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Préstamos');

  worksheet.columns = [
    { header: 'DNI Usuario', key: 'dni', width: 15 },
    { header: 'Nombre Usuario', key: 'usuario', width: 25 },
    { header: 'Libro', key: 'libro', width: 25 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Fecha Préstamo', key: 'fecha_prestamo', width: 20 },
    { header: 'Fecha Devolución', key: 'fecha_devolucion', width: 20 },
    { header: 'Fecha Entrega', key: 'fecha_entrega', width: 20 },
    { header: 'Género', key: 'genero', width: 12 },
    { header: 'Estado', key: 'estado', width: 15 },
    { header: 'Estado Interno', key: 'estado_interno', width: 18 },
    { header: 'Devuelto', key: 'devuelto', width: 12 },
  ];

  prestamos.forEach(p => {
    worksheet.addRow({
      ...p,
      fecha_prestamo: new Date(p.fecha_prestamo).toLocaleDateString('es-PE'),
      fecha_devolucion: new Date(p.fecha_devolucion).toLocaleDateString('es-PE'),
      fecha_entrega: p.fecha_entrega ? new Date(p.fecha_entrega).toLocaleDateString('es-PE') : 'Pendiente',
      devuelto: p.devuelto ? 'Sí' : 'No',
    });
  });

  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'reporte_prestamos.xlsx');
};


  // --- EXPORTAR A PDF ---
  const exportarPDF = async () => {
  const styles = StyleSheet.create({
    page: { padding: 20 },
    heading: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
    table: { display: "table", width: "auto", marginBottom: 10 },
    row: { flexDirection: "row", borderBottom: 1, padding: 4 },
    headerRow: { backgroundColor: '#eee', fontWeight: 'bold' },
    cell: { flex: 1, fontSize: 9, paddingRight: 4 },
  });

  const Doc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Reporte de Préstamos</Text>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.cell}>DNI</Text>
            <Text style={styles.cell}>Usuario</Text>
            <Text style={styles.cell}>Libro</Text>
            <Text style={styles.cell}>Categoría</Text>
            <Text style={styles.cell}>F. Préstamo</Text>
            <Text style={styles.cell}>F. Devolución</Text>
            <Text style={styles.cell}>F. Entrega</Text>
            <Text style={styles.cell}>Género</Text>
            <Text style={styles.cell}>Estado</Text>
            <Text style={styles.cell}>Interno</Text>
            <Text style={styles.cell}>Devuelto</Text>
          </View>

          {prestamos.map((p, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{p.dni}</Text>
              <Text style={styles.cell}>{p.usuario}</Text>
              <Text style={styles.cell}>{p.libro}</Text>
              <Text style={styles.cell}>{p.categoria}</Text>
              <Text style={styles.cell}>{new Date(p.fecha_prestamo).toLocaleDateString('es-PE')}</Text>
              <Text style={styles.cell}>{new Date(p.fecha_devolucion).toLocaleDateString('es-PE')}</Text>
              <Text style={styles.cell}>{p.fecha_entrega ? new Date(p.fecha_entrega).toLocaleDateString('es-PE') : 'Pendiente'}</Text>
              <Text style={styles.cell}>{p.genero}</Text>
              <Text style={styles.cell}>{p.estado}</Text>
              <Text style={styles.cell}>{p.estado_interno}</Text>
              <Text style={styles.cell}>{p.devuelto ? 'Sí' : 'No'}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(<Doc />).toBlob();
  saveAs(blob, 'reporte_prestamos.pdf');
};

  // --- LIBRO MÁS PRESTADO ---
  const librosData = useMemo(() => {
  const conteo = prestamos.reduce((acc, p) => {
    acc[p.libro] = (acc[p.libro] || 0) + 1;
    return acc;
  }, {});
  const labels = Object.keys(conteo);
  const data = Object.values(conteo);
  return {
    labels,
    datasets: [
      {
        label: 'Cantidad de Préstamos',
        data,
        backgroundColor: generarColores(labels.length),
      },
    ],
  };
}, [prestamos]);


  // --- CATEGORÍAS MÁS UTILIZADAS ---
  const categoriasData = useMemo(() => {
  const conteo = prestamos.reduce((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1;
    return acc;
  }, {});
  const labels = Object.keys(conteo);
  const data = Object.values(conteo);
  return {
    labels,
    datasets: [
      {
        label: 'Categorías',
        data,
        backgroundColor: generarColores(labels.length),
      },
    ],
  };
}, [prestamos]);


  // --- PRÉSTAMOS POR GÉNERO ---
  const generoData = useMemo(() => {
    const generoCount = prestamos.reduce(
      (acc, p) => {
        if (p.genero === 'masculino') acc.hombres++;
        else if (p.genero === 'femenino') acc.mujeres++;
        return acc;
      },
      { hombres: 0, mujeres: 0 }
    );
    return {
      labels: ['Hombres', 'Mujeres'],
      datasets: [
        {
          label: 'Cantidad',
          data: [generoCount.hombres, generoCount.mujeres],
          backgroundColor: ['#4BC0C0', '#FF6384'],
        },
      ],
    };
  }, [prestamos]);

  return (
    <div className="p-8 pt-23 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Reporte de Préstamos</h2>

      <div className="flex gap-4 mb-4">
        <button onClick={exportarExcel} className="bg-green-600 text-white px-4 py-2 rounded">
          Exportar a Excel
        </button>
        <button onClick={exportarPDF} className="bg-red-600 text-white px-4 py-2 rounded">
          Exportar a PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Libro más prestado</h3>
          <div style={{ maxHeight: 300 }}>
            <Bar data={librosData} options={{ indexAxis: 'y', plugins:{legend:{display: false}}}} />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Categorías más utilizadas</h3>
          <div style={{ maxHeight: 300 }}>
            <Bar data={categoriasData} options={{plugins:{legend:{display: false}}}} />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded shadow col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Préstamos por género</h3>
          <div style={{ maxWidth: 300, margin: '0 auto' }}>
            <Pie data={generoData} />
          </div>
        </div>
      </div>
<div className="overflow-x-auto rounded">
    <table className="min-w-[1000px] w-full text-sm border border-gray-300">
      <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wide">
        <tr>
          <th className="border px-3 py-2">DNI</th>
          <th className="border px-3 py-2">Usuario</th>
          <th className="border px-3 py-2">Libro</th>
          <th className="border px-3 py-2">Categoría</th>
          <th className="border px-3 py-2">Género</th>
          <th className="border px-3 py-2">Préstamo</th>
          <th className="border px-3 py-2">Devolución</th>
          <th className="border px-3 py-2">Entrega</th>
          <th className="border px-3 py-2">Devuelto</th>
          <th className="border px-3 py-2">Estado</th>
          <th className="border px-3 py-2">Destino</th>
          <th className="border px-3 py-2">Interno</th>
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {prestamos.map((p, idx) => (
          <tr key={idx} className="border-t hover:bg-gray-50">
            <td className="border px-3 py-2">{p.dni}</td>
            <td className="border px-3 py-2">{p.usuario}</td>
            <td className="border px-3 py-2">{p.libro}</td>
            <td className="border px-3 py-2">{p.categoria}</td>
            <td className="border px-3 py-2">{p.genero}</td>
            <td className="border px-3 py-2">{formatearFecha(p.fecha_prestamo)}</td>
            <td className="border px-3 py-2">{formatearFecha(p.fecha_devolucion)}</td>
            <td className="border px-3 py-2">{p.fecha_entrega ? formatearFecha(p.fecha_entrega) : 'Pendiente'}</td>
            <td className="border px-3 py-2">
              <span className={`px-2 py-1 rounded text-white ${p.devuelto ? 'bg-green-500' : 'bg-yellow-500'}`}>
                {p.devuelto ? 'Sí' : 'No'}
              </span>
            </td>
            <td className="border px-3 py-2 capitalize">{p.estado}</td>
            <td className="border px-3 py-2">{p.tipo_destino}</td>
            <td className="border px-3 py-2">
              <span
                className={`px-2 py-1 rounded text-white ${
                  p.estado_interno === 'retrasado'
                    ? 'bg-red-600'
                    : p.estado_interno === 'pendiente'
                    ? 'bg-orange-500'
                    : p.estado_interno === 'aceptado'
                    ? 'bg-green-600'
                    : 'bg-gray-400'
                }`}
              >
                {p.estado_interno}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
    </div>
  );
};

export default ReportePrestamos;



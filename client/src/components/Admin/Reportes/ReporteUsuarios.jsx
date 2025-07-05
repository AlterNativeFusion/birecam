import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { Page, Text, View, Document, StyleSheet, pdf } from '@react-pdf/renderer';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = 'https://birecam.onrender.com';

const ReporteUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users`);
        setUsuarios(res.data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };

    fetchUsuarios();
  }, []);

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');

    worksheet.columns = [
      { header: 'DNI', key: 'dni', width: 15 },
      { header: 'Nombres', key: 'nombres', width: 20 },
      { header: 'Apellidos', key: 'apellidos', width: 20 },
      { header: 'Tipo de usuario', key: 'tipo_usuario', width: 15 },
      { header: 'Correo', key: 'correo', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
    ];

    usuarios.forEach(usuario => {
      worksheet.addRow(usuario);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'reporte_usuarios.xlsx');
  };

  const exportarPDF = async () => {
    const styles = StyleSheet.create({
      page: { padding: 20 },
      section: { marginBottom: 10 },
      heading: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
      row: { flexDirection: 'row', marginBottom: 4 },
      cell: { width: '25%', fontSize: 10 },
    });

    const Doc = () => (
      <Document>
        <Page style={styles.page}>
          <Text style={styles.heading}>Reporte de Usuarios</Text>
          {usuarios.map((u, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{u.dni}</Text>
              <Text style={styles.cell}>{u.nombres}</Text>
              <Text style={styles.cell}>{u.apellidos}</Text>
              <Text style={styles.cell}>{u.tipo_usuario}</Text>
            </View>
          ))}
        </Page>
      </Document>
    );

    const blob = await pdf(<Doc />).toBlob();
    saveAs(blob, 'reporte_usuarios.pdf');
  };

  const tipoData = useMemo(() => {
    const tipos = usuarios.reduce((acc, u) => {
      acc[u.tipo_usuario] = (acc[u.tipo_usuario] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(tipos),
      datasets: [
        {
          data: Object.values(tipos),
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };
  }, [usuarios]);

  const generoData = useMemo(() => {
    const generoCount = usuarios.reduce(
      (acc, u) => {
        if (u.genero === 'masculino') acc.hombres++;
        else if (u.genero === 'femenino') acc.mujeres++;
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
  }, [usuarios]);

  const generoOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true },
    },
  };

  return (
    <div className="p-8 pt-23 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Reporte de Usuarios</h2>

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
          <h3 className="text-lg font-semibold mb-2">Usuarios por Tipo</h3>
          <div style={{ maxWidth: 300, margin: '0 auto' }}>
            <Pie data={tipoData} />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Usuarios por Género</h3>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <Bar data={generoData} options={generoOptions} />
          </div>
        </div>
      </div>

      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">DNI</th>
            <th className="border px-2 py-1">Nombres</th>
            <th className="border px-2 py-1">Apellidos</th>
            <th className="border px-2 py-1">Tipo de usuario</th>
            <th className="border px-2 py-1">Correo</th>
            <th className="border px-2 py-1">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="border px-2 py-1">{u.dni}</td>
              <td className="border px-2 py-1">{u.nombres}</td>
              <td className="border px-2 py-1">{u.apellidos}</td>
              <td className="border px-2 py-1">{u.tipo_usuario}</td>
              <td className="border px-2 py-1">{u.correo}</td>
              <td className="border px-2 py-1">{u.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReporteUsuarios;

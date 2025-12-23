import React from 'react';

export default function VacationsTable({ data, page, setPage }) {
  const list = Array.isArray(data?.list) ? data.list : [];

  if (data.loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="text-center py-20 text-gray-900">
        <i className="fas fa-exclamation-triangle text-6xl mb-4 text-red-400" />
        <p className="text-xl">{data.error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 text-gray-900 font-semibold">Funcionário</th>
              <th className="text-left py-4 px-4 text-gray-700 font-semibold hidden md:table-cell">Período</th>
              <th className="text-left py-4 px-4 text-gray-900 font-semibold">Status</th>
              <th className="text-left py-4 px-4 text-gray-700 font-semibold hidden lg:table-cell">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {list.map((vacation) => (
              <tr key={vacation.id} className="table-row border-b border-gray-100">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {vacation.employee.firstName?.[0]}{vacation.employee.lastName?.[0]}
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">{vacation.employee.firstName} {vacation.employee.lastName}</div>
                      <div className="text-gray-700 text-sm md:hidden">
                        {new Date(vacation.startDate).toLocaleDateString('pt-BR')} - {new Date(vacation.endDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-700 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-calendar text-blue-300" />
                    {new Date(vacation.startDate).toLocaleDateString('pt-BR')} - {new Date(vacation.endDate).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`badge status-badge badge-${vacation.status?.toLowerCase()}`}>
                    {vacation.status === 'PENDING' ? 'Pendente' : vacation.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-700 hidden lg:table-cell">
                  {vacation.requestReason || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-all"
        >
          <i className="fas fa-chevron-left" />
        </button>
        <span className="px-4 py-2 text-gray-900 font-semibold">Página {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={list.length < 10}
          className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-all"
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </>
  );
}

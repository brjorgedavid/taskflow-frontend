import React from 'react';

export default function EmployeesTable({ data, page, setPage }) {
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
              <th className="text-left py-4 px-4 text-gray-900 font-semibold">Nome</th>
              <th className="text-left py-4 px-4 text-gray-700 font-semibold hidden md:table-cell">Email</th>
              <th className="text-left py-4 px-4 text-gray-900 font-semibold">Cargo</th>
              <th className="text-left py-4 px-4 text-gray-700 font-semibold hidden lg:table-cell">Gestor</th>
            </tr>
          </thead>
          <tbody>
            {list.map((employee) => (
              <tr key={employee.id} className="table-row border-b border-gray-100">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {employee.firstName?.[0] || ''}{employee.lastName?.[0] || ''}
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">{employee.firstName} {employee.lastName}</div>
                      <div className="text-gray-700 text-sm md:hidden">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-700 hidden md:table-cell">{employee.email}</td>
                <td className="py-4 px-4">
                  <span className={`badge badge-${(employee.role || '').toLowerCase()}`}>{employee.role}</span>
                </td>
                <td className="py-4 px-4 text-gray-700 hidden lg:table-cell">
                  {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

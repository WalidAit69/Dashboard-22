import { useState, useEffect } from 'react';
import { Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardService from '../../services/dashboardService';

const TvnExpEcaTable = () => {
    const [tvnData, setTvnData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('poidsExporte');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchTvnData = async () => {
            try {
                setLoading(true);
                const data = await DashboardService.getTvnExpEca();
                setTvnData(data);
            } catch (error) {
                console.error('Error fetching TVN EXP ECA data:', error);
                setTvnData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTvnData();
    }, []);

    const formatNumber = (number) => {
        if (number == null) return '0';
        return Number(number).toLocaleString('fr-FR');
    };

    const formatTonnes = (kg) => {
        if (kg == null) return '0';
        const tonnes = kg / 1000;
        return tonnes.toLocaleString('fr-FR', { 
            minimumFractionDigits: tonnes < 1 ? 3 : 1,
            maximumFractionDigits: tonnes < 1 ? 3 : 1
        });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredAndSortedData = tvnData
        .filter(item => 
            item.nomvar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.codvar?.toString().includes(searchTerm)
        )
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

    // Pagination logic
    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const maxStock = Math.max(...tvnData.map(item => item.stock || 0));

    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const getStatusColor = (tauxExportation) => {
        if (tauxExportation >= 80) return 'text-green-600 bg-green-50';
        if (tauxExportation >= 60) return 'text-yellow-600 bg-yellow-50';
        if (tauxExportation >= 40) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="grid grid-cols-8 gap-4">
                                {[...Array(8)].map((_, colIndex) => (
                                    <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Données TVN EXP ECA
                        </h3>
                        <p className="text-sm text-gray-500">
                            {filteredAndSortedData.length} variété{filteredAndSortedData.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une variété..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value={5}>5 par page</option>
                            <option value={10}>10 par page</option>
                            <option value={20}>20 par page</option>
                            <option value={50}>50 par page</option>
                        </select>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('codvar')}
                            >
                                Code {getSortIcon('codvar')}
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('nomvar')}
                            >
                                Variété {getSortIcon('nomvar')}
                            </th>
                            <th 
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('totalEstime')}
                            >
                                Estimation (T) {getSortIcon('totalEstime')}
                            </th>
                            <th 
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('poidsReception')}
                            >
                                Réception (T) {getSortIcon('poidsReception')}
                            </th>
                            <th 
                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('poidsExporte')}
                            >
                                Exporté (T) {getSortIcon('poidsExporte')}
                            </th>
                            <th 
                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('stock')}
                            >
                                Stock (T) {getSortIcon('stock')}
                            </th>
                            <th 
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('freinte')}
                            >
                                Freinte (T) {getSortIcon('freinte')}
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <tr key={item.codvar} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.codvar}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="font-medium">{item.nomvar}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {formatTonnes(item.totalEstime)} T
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {formatTonnes(item.poidsReception)} T
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            <div className="font-medium">
                                                {formatTonnes(item.poidsExporte)} T
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.tauxExportation)}`}>
                                                {item.tauxExportation}%
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex flex-col items-center space-y-1">
                                            <div className="text-xs font-medium">
                                                {formatTonnes(item.stock)} T
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${maxStock > 0 ? ((item.stock || 0) / maxStock) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {maxStock > 0 ? (((item.stock || 0) / maxStock) * 100).toFixed(0) : 0}%
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {formatTonnes(item.freinte)} T
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                            title="Voir détails"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="text-gray-300 mb-2">📊</div>
                                        <p>Aucune donnée disponible</p>
                                        {searchTerm && (
                                            <p className="text-sm mt-1">
                                                Aucun résultat pour "{searchTerm}"
                                            </p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            Affichage de {startIndex + 1} à {Math.min(endIndex, totalItems)} sur {totalItems} résultats
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filteredAndSortedData.length > 0 && totalPages <= 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-4">
                            <span>
                                <strong>Total Exporté:</strong> {formatTonnes(filteredAndSortedData.reduce((sum, item) => sum + (item.poidsExporte || 0), 0))} T
                            </span>
                            <span>
                                <strong>Total Stock:</strong> {formatTonnes(filteredAndSortedData.reduce((sum, item) => sum + (item.stock || 0), 0))} T
                            </span>
                        </div>
                        <div>
                            <strong>Taux Export Moyen:</strong> {
                                filteredAndSortedData.length > 0 
                                    ? (filteredAndSortedData.reduce((sum, item) => sum + (item.tauxExportation || 0), 0) / filteredAndSortedData.length).toFixed(1)
                                    : 0
                            }%
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TvnExpEcaTable;
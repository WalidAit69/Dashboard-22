import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Download, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Search, Pen } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from "../../utils/Api";
import ConfirmationModal from '../producteur/ConfirmationModal';
import FilterSidebar from './FilterSidebar';

const ParcelleTable = ({
    filteredData = [],
    onRefresh,
    filters = {},
    onFilterChange,
    cascadingOptions = {},
    filterOptions = {},
    filtersLoading = false,
    hasActiveFilters = false,
    clearAllFilters
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // State for delete modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        parcelle: null,
        loading: false
    });

    // Delete parcelle function
    const handleDelete = async () => {
        setDeleteModal(prev => ({ ...prev, loading: true }));

        try {
            await API.delete(`/Parcelles/${deleteModal.parcelle.idparcelle}`);

            // Close modal
            setDeleteModal({ isOpen: false, parcelle: null, loading: false });

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting parcelle:', error);
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    // Open delete modal
    const openDeleteModal = (parcelle) => {
        setDeleteModal({
            isOpen: true,
            parcelle: parcelle,
            loading: false
        });
    };

    // Close delete modal
    const closeDeleteModal = () => {
        if (!deleteModal.loading) {
            setDeleteModal({
                isOpen: false,
                parcelle: null,
                loading: false
            });
        }
    };

    // Use filtered data directly from parent - no additional filtering needed
    const displayedParcelles = filteredData;

    // Pagination logic
    const totalPages = Math.ceil(displayedParcelles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedParcelles = displayedParcelles.slice(startIndex, startIndex + itemsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData.length, filters]);

    const getBooleanBadge = (value) => {
        const styles = {
            'O': 'bg-green-100 text-green-800',
            'OUI': 'bg-green-100 text-green-800',
            'N': 'bg-red-100 text-red-800',
            'NON': 'bg-red-100 text-red-800',
        };
        return styles[value] || 'bg-gray-100 text-gray-800';
    };

    const getParcelleColor = (refpar) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];
        return colors[(refpar?.charCodeAt(0) || 0) % colors.length];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR');
        } catch {
            return dateString;
        }
    };

    const formatCoordinates = (lat, lng) => {
        if (!lat || !lng) return 'N/A';
        return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    };

    return (
        <>
            <div className="flex min-h-screen gap-6">
                <FilterSidebar
                    filters={filters}
                    onFilterChange={onFilterChange}
                    cascadingOptions={cascadingOptions}
                    filterOptions={filterOptions}
                    filtersLoading={filtersLoading}
                    hasActiveFilters={hasActiveFilters}
                    clearAllFilters={clearAllFilters}
                />

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            {/* Search and Actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="relative">
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-10"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher une parcelle..."
                                            value={filters.searchTerm || ''}
                                            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            Exporter
                                        </button>
                                        <Link to={"/parcelle/add"} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Nouvelle Parcelle
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PARCELLE</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUPERFICIE</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ARBRES</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IRRIGATION</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COORDONNÉES</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLANTATION</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedParcelles.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                {displayedParcelles.length === 0 && filteredData.length === 0
                                                    ? "Aucune parcelle trouvée"
                                                    : "Aucun résultat trouvé pour votre recherche"}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedParcelles.map((parcelle) => (
                                            <tr key={parcelle.idparcelle} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 rounded-full ${getParcelleColor(parcelle.refpar)} flex items-center justify-center text-white text-sm font-medium mr-3`}>
                                                            {parcelle.refpar?.substring(0, 2).toUpperCase() || 'P'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{parcelle.refpar || 'N/A'}</div>
                                                            <div className="text-xs text-gray-400">ID: {parcelle.idparcelle}</div>
                                                            {parcelle.estimation && (
                                                                <div className="text-xs text-gray-500">Est: {parseFloat(parcelle.estimation).toLocaleString()}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {parcelle.suppar ? `${parseFloat(parcelle.suppar).toLocaleString()} ha` : 'N/A'}
                                                    </div>
                                                    {parcelle.ecarte && parcelle.espace ? (
                                                        <div className="text-xs text-gray-500">
                                                            Écart: {parcelle.ecarte}m × {parcelle.espace}m
                                                        </div>
                                                    ) : <></>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {parcelle.nbrarb ? parseInt(parcelle.nbrarb).toLocaleString() : '0'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{parcelle.irriga || 'N/A'}</div>
                                                    {parcelle.typefilet && (
                                                        <div className="text-xs text-gray-500">Filet: {parcelle.typefilet}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatCoordinates(parcelle.latitude, parcelle.longitude)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(parcelle.dtepln)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBooleanBadge(parcelle.traite)}`}>
                                                                {parcelle.traite === 'OUI' ? 'Traité' : parcelle.traite === 'NON' ? 'Non traité' : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBooleanBadge(parcelle.certif)}`}>
                                                                {parcelle.certif === 'OUI' ? 'Certifié' : parcelle.certif === 'NON' ? 'Non certifié' : 'N/A'}
                                                            </span>
                                                        </div>
                                                        {parcelle.couverture && (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBooleanBadge(parcelle.couverture)}`}>
                                                                    {parcelle.couverture === 'O' ? 'Couvert' : 'Non couvert'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            to={`/parcelle/${parcelle.idparcelle}`}
                                                            className="text-gray-400 hover:text-primary-600 transition-colors"
                                                            title="Voir les détails"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(parcelle)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <Link
                                                            to={`/parcelle/edit/${parcelle.idparcelle}`}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <Pen className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                                <div className="text-sm text-gray-500">
                                    Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, displayedParcelles.length)} sur {displayedParcelles.length} entrées
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
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
                                                className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === pageNum
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-500 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer la parcelle {itemName} ? Cette action est irréversible."
                itemName={deleteModal.parcelle?.refpar}
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={deleteModal.loading}
                loadingText="Suppression..."
                type="danger"
            />
        </>
    );
};

export default ParcelleTable;
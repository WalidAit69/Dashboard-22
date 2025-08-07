import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Download, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Search, Pen, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from "../../utils/Api";
import Loader from '../ui/Loader';
import ConfirmationModal from '../producteur/ConfirmationModal';
import MultiSelectListbox from '../../components/parcelle/MultiSelectListbox';

const ParcelleTable = ({
    initialData = [],
    onRefresh,
    filters = {},
    onFilterChange,
    filterOptions = {},
    filtersLoading = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [traiteFilter, setTraiteFilter] = useState('');
    const [certifFilter, setCertifFilter] = useState('');
    const [couvertureFilter, setCouvertureFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // State for cascading filters
    const [cascadingFilters, setCascadingFilters] = useState({
        codcul: [],
        codgrpvar: '',
        codvar: [],
        codsvar: ''
    });

    // State for cascading filter options
    const [cascadingOptions, setCascadingOptions] = useState({
        cultures: filterOptions.cultures || [],
        groupeVarietes: [],
        varietes: [],
        sousVarietes: []
    });

    // State for delete modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        parcelle: null,
        loading: false
    });

    // Update cascading filters when filterOptions change
    useEffect(() => {
        setCascadingOptions(prev => ({
            ...prev,
            cultures: filterOptions.cultures || []
        }));
    }, [filterOptions.cultures]);

    const handleCascadingFilterChange = async (filterType, value) => {
        console.log(`Filter change: ${filterType} = ${value}`); // Debug log

        // Update the filter value
        const newFilters = { ...cascadingFilters };

        if (filterType === 'codcul') {
            newFilters.codcul = value;
            newFilters.codgrpvar = '';
            newFilters.codvar = [];
            newFilters.codsvar = '';

            // Fetch dependent data when culture(s) are selected
            if (value && value.length > 0) {
                try {
                    console.log(`Fetching GroupeVarietes and Varietes for cultures: ${value}`);

                    const [groupeVarietesResponse, varietesResponse] = await Promise.all([
                        API.get(`/GroupVarietes`),
                        API.get(`/Varietes`)
                    ]);

                    console.log('All GroupeVarietes:', groupeVarietesResponse.data);
                    console.log('All Varietes:', varietesResponse.data);

                    // Convert value array to numbers for consistent comparison
                    const selectedCultureCodes = value.map(v => Number(v));

                    // Filter by selected cultures (multiple values) - FIXED: consistent type conversion
                    const filteredGroupeVarietes = groupeVarietesResponse.data?.filter(gv => {
                        console.log(`Checking GroupeVariete: ${gv.codgrpvar}, numcul: ${gv.codcul} vs selected: ${selectedCultureCodes}`);
                        return gv.codcul && selectedCultureCodes.includes(Number(gv.codcul));
                    }) || [];

                    const filteredVarietes = varietesResponse.data?.filter(v => {
                        console.log(`Checking Variete: ${v.codvar}, numcul: ${v.codcul} vs selected: ${selectedCultureCodes}`);
                        return v.codcul && selectedCultureCodes.includes(Number(v.codcul));
                    }) || [];

                    console.log('Filtered GroupeVarietes:', filteredGroupeVarietes);
                    console.log('Filtered Varietes:', filteredVarietes);

                    setCascadingOptions(prev => ({
                        ...prev,
                        groupeVarietes: filteredGroupeVarietes, // FIXED: use filtered data instead of all data
                        varietes: filteredVarietes,
                        sousVarietes: []
                    }));
                } catch (error) {
                    console.error('Error fetching groupe varietes and varietes:', error);
                    setCascadingOptions(prev => ({
                        ...prev,
                        groupeVarietes: [],
                        varietes: [],
                        sousVarietes: []
                    }));
                }
            } else {
                // Clear all dependent options when no culture is selected
                setCascadingOptions(prev => ({
                    ...prev,
                    groupeVarietes: [],
                    varietes: [],
                    sousVarietes: []
                }));
            }
        }
        else if (filterType === 'codgrpvar') {
            newFilters.codgrpvar = value;
            newFilters.codvar = [];
            newFilters.codsvar = '';

            // Filter existing varietes by selected groupe variete
            if (value) {
                // Use the already filtered varietes from culture selection
                const filteredVarietes = cascadingOptions.varietes?.filter(v => {
                    console.log(`Filtering Variete by GroupeVariete: ${v.codvar}, codgrpvar: ${v.codgrpvar} vs selected: ${value}`);
                    return v.codgrpvar && Number(v.codgrpvar) === Number(value); // FIXED: consistent number comparison
                }) || [];

                console.log('Varietes filtered by GroupeVariete:', filteredVarietes);

                setCascadingOptions(prev => ({
                    ...prev,
                    varietes: filteredVarietes,
                    sousVarietes: []
                }));
            } else {
                // If no groupe variete selected, show all varietes for the selected cultures
                if (cascadingFilters.codcul && cascadingFilters.codcul.length > 0) {
                    try {
                        const varietesResponse = await API.get(`/Varietes`);
                        const selectedCultureCodes = cascadingFilters.codcul.map(v => Number(v));
                        const filteredVarietes = varietesResponse.data?.filter(v =>
                            v.numcul && selectedCultureCodes.includes(Number(v.numcul)) // FIXED: use numcul and consistent comparison
                        ) || [];

                        setCascadingOptions(prev => ({
                            ...prev,
                            varietes: filteredVarietes,
                            sousVarietes: []
                        }));
                    } catch (error) {
                        console.error('Error re-fetching varietes:', error);
                    }
                }
            }
        }
        else if (filterType === 'codvar') {
            newFilters.codvar = value;
            newFilters.codsvar = '';

            // Fetch all sous varietes when variete(s) are selected
            if (value && value.length > 0) {
                try {
                    console.log(`Fetching SousVarietes for varietes: ${value}`);
                    const response = await API.get(`/SousVarietes`);
                    console.log('All SousVarietes:', response.data);

                    // Convert value array to numbers for consistent comparison
                    const selectedVarieteCodes = value.map(v => Number(v));

                    // Filter by selected varietes (multiple values)
                    const filteredSousVarietes = response.data?.filter(sv => {
                        console.log(`Checking SousVariete: ${sv.codsvar}, codvar: ${sv.codvar} vs selected: ${selectedVarieteCodes}`);
                        return sv.codvar && selectedVarieteCodes.includes(Number(sv.codvar)); // FIXED: consistent number comparison
                    }) || [];

                    console.log('Filtered SousVarietes:', filteredSousVarietes);

                    setCascadingOptions(prev => ({
                        ...prev,
                        sousVarietes: filteredSousVarietes
                    }));
                } catch (error) {
                    console.error('Error fetching sous varietes:', error);
                    setCascadingOptions(prev => ({
                        ...prev,
                        sousVarietes: []
                    }));
                }
            } else {
                // Clear sous varietes when no variete is selected
                setCascadingOptions(prev => ({
                    ...prev,
                    sousVarietes: []
                }));
            }
        }
        else if (filterType === 'codsvar') {
            newFilters.codsvar = value;
        }

        console.log('New cascading filters:', newFilters);
        setCascadingFilters(newFilters);

        // Notify parent component of filter changes
        if (onFilterChange) {
            onFilterChange(filterType, value);
        }
    };

    // Also add debugging to see the current state
    useEffect(() => {
        console.log('Cascading filters state:', cascadingFilters);
        console.log('Cascading options state:', cascadingOptions);
    }, [cascadingFilters, cascadingOptions]);

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

    // Filter and search logic - only using initialData passed from parent
    const filteredParcelles = useMemo(() => {
        if (!initialData.length) return [];

        return initialData.filter(parcelle => {
            const matchesSearch =
                (parcelle.refpar?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                (parcelle.latitude?.toString().includes(searchTerm) || '') ||
                (parcelle.longitude?.toString().includes(searchTerm) || '') ||
                (parcelle.irriga?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

            // Basic table filters
            const matchesTraite = !traiteFilter || parcelle.traite === traiteFilter;
            const matchesCertif = !certifFilter || parcelle.certif === certifFilter;
            const matchesCouverture = !couvertureFilter || parcelle.couverture === couvertureFilter;

            // Vergers filter (from parent filters)
            const matchesVerger = !filters.refver || parcelle.refver === filters.refver;

            return matchesSearch && matchesTraite && matchesCertif && matchesCouverture && matchesVerger;
        });
    }, [initialData, searchTerm, traiteFilter, certifFilter, couvertureFilter, cascadingFilters, filters.refver]);


    // Pagination logic
    const totalPages = Math.ceil(filteredParcelles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedParcelles = filteredParcelles.slice(startIndex, startIndex + itemsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, traiteFilter, certifFilter, couvertureFilter, cascadingFilters]);

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

    const hasActiveTableFilters = traiteFilter || certifFilter || couvertureFilter;
    const hasActiveCascadingFilters = cascadingFilters.codcul.length > 0 || cascadingFilters.codvar.length > 0 || cascadingFilters.codsvar;
    const hasAnyActiveFilters = hasActiveTableFilters || hasActiveCascadingFilters;

    // Clear all filters function
    const clearAllFilters = () => {
        setTraiteFilter('');
        setCertifFilter('');
        setCouvertureFilter('');
        setCascadingFilters({
            codcul: '',
            codgrpvar: '',
            codvar: '',
            codsvar: ''
        });
        setCascadingOptions(prev => ({
            ...prev,
            groupeVarietes: [],
            varietes: [],
            sousVarietes: []
        }));
        // Clear vergers filter
        if (onFilterChange) {
            onFilterChange('refver', '');
        }
    };

    const cultureOptions = cascadingOptions.cultures?.map(c => ({
        value: c.codcul,
        label: c.nomcul || c.codcul
    })) || [];

    const varieteOptions = cascadingOptions.varietes?.map(v => ({
        value: v.codvar,
        label: v.nomvar || v.codvar
    })) || [];

    return (
        <>
            <div className="flex min-h-screen gap-6">
                {/* Filter Sidebar */}
                <div className="w-80 bg-white shadow-sm border border-gray-200 rounded-lg h-fit">
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {filtersLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Basic Filters */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Filtres de base</h3>
                                        <div className="space-y-4">
                                            {/* Traitement Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Traitement</label>
                                                <div className="relative">
                                                    <select
                                                        value={traiteFilter}
                                                        onChange={(e) => setTraiteFilter(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                    >
                                                        <option value="">Tous les traitements</option>
                                                        <option value="OUI">Traité</option>
                                                        <option value="NON">Non traité</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Certification Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Certification</label>
                                                <div className="relative">
                                                    <select
                                                        value={certifFilter}
                                                        onChange={(e) => setCertifFilter(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                    >
                                                        <option value="">Toutes les certifications</option>
                                                        <option value="OUI">Certifié</option>
                                                        <option value="NON">Non certifié</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Couverture Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Couverture</label>
                                                <div className="relative">
                                                    <select
                                                        value={couvertureFilter}
                                                        onChange={(e) => setCouvertureFilter(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                    >
                                                        <option value="">Toutes les couvertures</option>
                                                        <option value="O">Avec couverture</option>
                                                        <option value="N">Sans couverture</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specialized Cascading Filters */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Filtres spécialisés</h3>
                                        <div className="space-y-4">
                                            {/* Culture Filter */}
                                            <MultiSelectListbox
                                                label="Culture"
                                                options={cultureOptions}
                                                selectedValues={cascadingFilters.codcul}
                                                onChange={(values) => handleCascadingFilterChange('codcul', values)}
                                                placeholder="Toutes les cultures"
                                            />

                                            {/* Groupe Variété Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Groupe Variété</label>
                                                <div className="relative">
                                                    <select
                                                        value={cascadingFilters.codgrv}
                                                        onChange={(e) => handleCascadingFilterChange('codgrpvar', e.target.value)}
                                                        disabled={cascadingFilters.codcul.length === 0}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                                                    >
                                                        <option value="">Tous les groupes variétés</option>
                                                        {cascadingOptions.groupeVarietes?.map((gv) => (
                                                            <option key={gv.codgrv} value={gv.codgrv}>
                                                                {gv.nomgrv || gv.codgrv}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Variété Filter */}
                                            <MultiSelectListbox
                                                label="Variété"
                                                options={varieteOptions}
                                                selectedValues={cascadingFilters.codvar}
                                                onChange={(values) => handleCascadingFilterChange('codvar', values)}
                                                disabled={cascadingFilters.codcul.length === 0}
                                                placeholder="Toutes les variétés"
                                            />


                                            {/* Sous-Variété Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Sous-Variété</label>
                                                <div className="relative">
                                                    <select
                                                        value={cascadingFilters.codsvar}
                                                        onChange={(e) => handleCascadingFilterChange('codsvar', e.target.value)}
                                                        disabled={cascadingFilters.codvar.length === 0}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                                                    >
                                                        <option value="">Toutes les sous-variétés</option>
                                                        {cascadingOptions.sousVarietes?.map((sv) => (
                                                            <option key={sv.codsvar} value={sv.codsvar}>
                                                                {sv.nomsvar || sv.codsvar}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Vergers Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Vergers</label>
                                                <div className="relative">
                                                    <select
                                                        value={filters.refver || ''}
                                                        onChange={(e) => onFilterChange && onFilterChange('refver', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                                    >
                                                        <option value="">Tous les vergers</option>
                                                        {filterOptions.vergers?.map((v) => (
                                                            <option key={v.refver} value={v.refver}>
                                                                {v.nomver || v.refver}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Filters Display */}
                                    {hasAnyActiveFilters && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-900">Filtres actifs:</span>
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    Effacer tous
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Multi-select Culture filter tags */}
                                                {cascadingFilters.codcul.map(codcul => {
                                                    const culture = cultureOptions.find(c => c.value === codcul);
                                                    return (
                                                        <span key={codcul} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            Culture: {culture?.label || codcul}
                                                            <button
                                                                onClick={() => {
                                                                    const newValues = cascadingFilters.codcul.filter(v => v !== codcul);
                                                                    handleCascadingFilterChange('codcul', newValues);
                                                                }}
                                                                className="hover:text-blue-900"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    );
                                                })}

                                                {/* Multi-select Variete filter tags */}
                                                {cascadingFilters.codvar.map(codvar => {
                                                    const variete = varieteOptions.find(v => v.value === codvar);
                                                    return (
                                                        <span key={codvar} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            Variété: {variete?.label || codvar}
                                                            <button
                                                                onClick={() => {
                                                                    const newValues = cascadingFilters.codvar.filter(v => v !== codvar);
                                                                    handleCascadingFilterChange('codvar', newValues);
                                                                }}
                                                                className="hover:text-blue-900"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    );
                                                })}

                                                {/* Single-select filters (keeping original logic) */}
                                                {cascadingFilters.codsvar && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        Sous-Variété: {cascadingFilters.codsvar}
                                                        <button
                                                            onClick={() => handleCascadingFilterChange('codsvar', '')}
                                                            className="hover:text-blue-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}

                                                {filters.refver && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        Verger: {filters.refver}
                                                        <button
                                                            onClick={() => onFilterChange && onFilterChange('refver', '')}
                                                            className="hover:text-blue-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                                {filteredParcelles.length === 0 && initialData.length > 0
                                                    ? "Aucun résultat trouvé pour votre recherche"
                                                    : "Aucune parcelle trouvée"}
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
                                    Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredParcelles.length)} sur {filteredParcelles.length} entrées
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
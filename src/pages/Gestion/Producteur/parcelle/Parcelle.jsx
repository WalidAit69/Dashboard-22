import { useState, useEffect, useMemo } from 'react';
import AnalyticsCard from '../../../../components/Gestion/dashboard/AnalyticsCard'
import ParcelleTable from '../../../../components/Gestion/parcelle/ParcelleTable'
import { MapPin, Trees, Droplets } from 'lucide-react';
import API from "../../../../utils/Api";
import Loader from '../../../../components/ui/Loader';

function Parcelle() {
    const [parcelles, setParcelles] = useState([]);
    const [vergers, setVergers] = useState([]);
    const [cultures, setCultures] = useState([]);
    const [sousVarietes, setSousVarietes] = useState([]);
    const [varietes, setVarietes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtersLoading, setFiltersLoading] = useState(false);

    const [filters, setFilters] = useState({
        // Table basic filters
        searchTerm: '',
        traite: '',
        certif: '',
        couverture: '',
        
        // Specialized filters (Filtres spécialisés)
        refver: '',
        codcul: [],
        codgrpvar: '',
        codvar: [],
        codsvar: ''
    });

    // Cascading filter options state
    const [cascadingOptions, setCascadingOptions] = useState({
        cultures: [],
        groupeVarietes: [],
        varietes: [],
        sousVarietes: []
    });
    
    // Fetch parcelles data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await API.get("/Parcelles");

            if (res.data && Array.isArray(res.data)) {
                setParcelles(res.data);
            } else {
                const data = res.data ? [res.data] : [];
                setParcelles(data);
            }
        } catch (error) {
            console.error('Error fetching parcelles:', error);
            setError({
                message: error.response?.data?.message || error.message || 'Failed to fetch data',
                status: error.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch filter data
    const fetchFilterData = async () => {
        try {
            setFiltersLoading(true);

            const [vergersRes, culturesRes, sousVarietesRes, varietesRes] = await Promise.all([
                API.get("/Vergers"),
                API.get("/Cultures"),
                API.get("/SousVarietes"),
                API.get("/Varietes")
            ]);

            setVergers(Array.isArray(vergersRes.data) ? vergersRes.data : []);
            setCultures(Array.isArray(culturesRes.data) ? culturesRes.data : []);
            setSousVarietes(Array.isArray(sousVarietesRes.data) ? sousVarietesRes.data : []);
            setVarietes(Array.isArray(varietesRes.data) ? varietesRes.data : []);

            // Initialize cascading options with cultures
            setCascadingOptions(prev => ({
                ...prev,
                cultures: Array.isArray(culturesRes.data) ? culturesRes.data : []
            }));
        } catch (error) {
            console.error('Error fetching filter data:', error);
        } finally {
            setFiltersLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchFilterData();
    }, []);

    // Handle cascading filter logic
    const handleCascadingFilterChange = async (filterType, value) => {
        console.log(`Filter change: ${filterType} = ${value}`);

        // Update the filter value
        const newFilters = { ...filters };

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

                    // Filter by selected cultures
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
                        groupeVarietes: filteredGroupeVarietes,
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
                    return v.codgrpvar && Number(v.codgrpvar) === Number(value);
                }) || [];

                console.log('Varietes filtered by GroupeVariete:', filteredVarietes);

                setCascadingOptions(prev => ({
                    ...prev,
                    varietes: filteredVarietes,
                    sousVarietes: []
                }));
            } else {
                // If no groupe variete selected, show all varietes for the selected cultures
                if (filters.codcul && filters.codcul.length > 0) {
                    try {
                        const varietesResponse = await API.get(`/Varietes`);
                        const selectedCultureCodes = filters.codcul.map(v => Number(v));
                        const filteredVarietes = varietesResponse.data?.filter(v =>
                            v.codcul && selectedCultureCodes.includes(Number(v.codcul))
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

            // Fetch sous varietes when variete(s) are selected
            if (value && value.length > 0) {
                try {
                    console.log(`Fetching SousVarietes for varietes: ${value}`);
                    const response = await API.get(`/SousVarietes`);
                    console.log('All SousVarietes:', response.data);

                    // Convert value array to numbers for consistent comparison
                    const selectedVarieteCodes = value.map(v => Number(v));

                    // Filter by selected varietes
                    const filteredSousVarietes = response.data?.filter(sv => {
                        console.log(`Checking SousVariete: ${sv.codsvar}, codvar: ${sv.codvar} vs selected: ${selectedVarieteCodes}`);
                        return sv.codvar && selectedVarieteCodes.includes(Number(sv.codvar));
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

        console.log('New filters:', newFilters);
        setFilters(newFilters);
    };

    // Handle basic filter changes
    const handleFilterChange = (filterKey, value) => {
        console.log(`Basic filter change: ${filterKey} = `, value);
        
        if (filterKey === 'codcul' || filterKey === 'codgrpvar' || filterKey === 'codvar' || filterKey === 'codsvar') {
            // Handle cascading filters
            handleCascadingFilterChange(filterKey, value);
        } else {
            // Handle basic filters
            setFilters(prev => ({
                ...prev,
                [filterKey]: value
            }));
        }
    };

    // Apply ALL filters - consolidated filtering logic
    const filteredParcelles = useMemo(() => {
        let filtered = parcelles;

        // Basic search filter
        if (filters.searchTerm) {
            filtered = filtered.filter(parcelle => {
                const searchLower = filters.searchTerm.toLowerCase();
                return (
                    (parcelle.refpar?.toLowerCase().includes(searchLower) || false) ||
                    (parcelle.latitude?.toString().includes(filters.searchTerm) || false) ||
                    (parcelle.longitude?.toString().includes(filters.searchTerm) || false) ||
                    (parcelle.irriga?.toLowerCase().includes(searchLower) || false)
                );
            });
        }

        // Basic table filters
        if (filters.traite) {
            filtered = filtered.filter(p => p.traite === filters.traite);
        }

        if (filters.certif) {
            filtered = filtered.filter(p => p.certif === filters.certif);
        }

        if (filters.couverture) {
            filtered = filtered.filter(p => p.couverture === filters.couverture);
        }

        // Specialized filters
        if (filters.refver) {
            filtered = filtered.filter(p => {
                return p.refver != null && Number(p.refver) === Number(filters.refver);
            });
        }

        // Handle multi-select culture filter
        if (filters.codcul && Array.isArray(filters.codcul) && filters.codcul.length > 0) {
            filtered = filtered.filter(p => {
                const parcelleCodeCul = p.numcul;
                const match = parcelleCodeCul != null && filters.codcul.includes(Number(parcelleCodeCul));
                return match;
            });
        }

        // Handle multi-select variete filter
        if (filters.codvar && Array.isArray(filters.codvar) && filters.codvar.length > 0) {
            filtered = filtered.filter(p => {
                const match = p.codvar != null && filters.codvar.includes(Number(p.codvar));
                return match;
            });
        }

        // Single-select filters
        if (filters.codsvar) {
            filtered = filtered.filter(p => {
                const match = p.codsvar != null && Number(p.codsvar) === Number(filters.codsvar);
                return match;
            });
        }

        if (filters.codgrpvar) {
            filtered = filtered.filter(p => {
                // Assuming there's a codgrpvar field in parcelle data
                const match = p.codgrpvar != null && Number(p.codgrpvar) === Number(filters.codgrpvar);
                return match;
            });
        }

        return filtered;
    }, [parcelles, filters]);

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({
            searchTerm: '',
            traite: '',
            certif: '',
            couverture: '',
            refver: '',
            codcul: [],
            codgrpvar: '',
            codvar: [],
            codsvar: ''
        });

        // Reset cascading options
        setCascadingOptions(prev => ({
            ...prev,
            groupeVarietes: [],
            varietes: [],
            sousVarietes: []
        }));
    };

    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some(value => {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return value !== '';
    });
    
    // Calculate analytics based on filtered parcelles data
    const calculateAnalytics = () => {
        if (!filteredParcelles.length) {
            return {
                totalParcelles: 0,
                totalSuperficie: 0,
                totalArbres: 0,
                parcellesIrriguees: 0
            };
        }

        const totalParcelles = filteredParcelles.length;
        const totalSuperficie = filteredParcelles.reduce((sum, p) => sum + (parseFloat(p.suppar) || 0), 0);
        const totalArbres = filteredParcelles.reduce((sum, p) => sum + (parseInt(p.nbrarb) || 0), 0);
        const parcellesIrriguees = filteredParcelles.filter(p => p.irriga && p.irriga.trim() !== '').length;

        return {
            totalParcelles,
            totalSuperficie,
            totalArbres,
            parcellesIrriguees
        };
    };

    const analytics = calculateAnalytics();

    // Mock percentage changes (in a real app, compare with previous period)
    const getChangePercentage = (current, type) => {
        const mockPrevious = {
            totalParcelles: Math.max(1, Math.floor(current * 0.9)),
            totalSuperficie: Math.max(1, Math.floor(current * 0.85)),
            totalArbres: Math.max(1, Math.floor(current * 0.88)),
            parcellesIrriguees: Math.max(1, Math.floor(current * 0.92))
        };

        const previous = mockPrevious[type] || 1;
        const change = ((current - previous) / previous) * 100;
        return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
    };

    const cards = [
        {
            title: "Total Parcelles",
            value: analytics.totalParcelles.toLocaleString(),
            change: getChangePercentage(analytics.totalParcelles, 'totalParcelles'),
            subtitle: "Nombre total de parcelles",
            icon: MapPin,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            changeColor: analytics.totalParcelles > 0 ? "text-green-600" : "text-gray-500"
        },
        {
            title: "Superficie Totale",
            value: `${analytics.totalSuperficie.toLocaleString()} ha`,
            change: getChangePercentage(analytics.totalSuperficie, 'totalSuperficie'),
            subtitle: "Surface cultivée totale",
            icon: MapPin,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            changeColor: analytics.totalSuperficie > 0 ? "text-green-600" : "text-gray-500"
        },
        {
            title: "Total Arbres",
            value: analytics.totalArbres.toLocaleString(),
            change: getChangePercentage(analytics.totalArbres, 'totalArbres'),
            subtitle: "Nombre total d'arbres",
            icon: Trees,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            changeColor: analytics.totalArbres > 0 ? "text-green-600" : "text-gray-500"
        },
        {
            title: "Parcelles Irriguées",
            value: analytics.parcellesIrriguees.toLocaleString(),
            change: getChangePercentage(analytics.parcellesIrriguees, 'parcellesIrriguees'),
            subtitle: "Avec système d'irrigation",
            icon: Droplets,
            iconBg: "bg-cyan-100",
            iconColor: "text-cyan-600",
            changeColor: analytics.parcellesIrriguees > 0 ? "text-green-600" : "text-gray-500"
        }
    ];

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
                    <p className="text-gray-500 mb-4">{error.message}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="flex flex-col gap-4 sm:gap-0">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:p-6">
                    {cards.map((card, index) => (
                        <AnalyticsCard card={card} key={index} />
                    ))}
                </div>

                {/* Results Summary */}
                <div className="sm:px-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <p className="text-sm text-gray-600">
                            Affichage de <span className="font-semibold text-gray-900">{filteredParcelles.length}</span> parcelles
                            {hasActiveFilters && (
                                <span> sur <span className="font-semibold text-gray-900">{parcelles.length}</span> au total</span>
                            )}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="ml-3 text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Parcelle Table with all filters managed by parent */}
                <div className='sm:px-6'>
                    <ParcelleTable
                        filteredData={filteredParcelles}
                        onRefresh={fetchData}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        cascadingOptions={cascadingOptions}
                        filterOptions={{
                            vergers,
                            cultures,
                            sousVarietes,
                            varietes
                        }}
                        filtersLoading={filtersLoading}
                        hasActiveFilters={hasActiveFilters}
                        clearAllFilters={clearAllFilters}
                    />
                </div>
            </div>
        </div>
    )
}

export default Parcelle
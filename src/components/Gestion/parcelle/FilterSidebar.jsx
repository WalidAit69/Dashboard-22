import { Filter, RotateCcw, X, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import AccordionCheckbox from './AccordionCheckbox';
import CustomSelect from './CustomSelect';

const FilterSidebar = ({
    filters = {},
    onFilterChange,
    cascadingOptions = {},
    filterOptions = {},
    filtersLoading = false,
    hasActiveFilters = false,
    clearAllFilters
}) => {
    // State for accordion sections
    const [isBasicFiltersOpen, setIsBasicFiltersOpen] = useState(true);
    const [isSpecializedFiltersOpen, setIsSpecializedFiltersOpen] = useState(true);

    // Generate options for dropdowns
    const cultureOptions = cascadingOptions.cultures?.map(c => ({
        value: c.codcul,
        label: c.nomcul || c.codcul
    })) || [];

    const varieteOptions = cascadingOptions.varietes?.map(v => ({
        value: v.codvar,
        label: v.nomvar || v.codvar
    })) || [];

    return (
        <div className="w-80 bg-white shadow-lg border border-gray-200 rounded-xl h-fit overflow-hidden">
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-300 text-white p-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Filtres</h2>
                    </div>
                    {hasActiveFilters && (
                        <p className="text-blue-100 text-sm mt-1">
                            Filtres actifs appliqués
                        </p>
                    )}
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                    {filtersLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="p-4 space-y-6">
                            {/* Basic Filters Accordion */}
                            <div className="rounded-lg">
                                <button
                                    onClick={() => setIsBasicFiltersOpen(!isBasicFiltersOpen)}
                                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-200 rounded-t-lg"
                                >
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            Filtres de base
                                        </div>
                                        <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${!isBasicFiltersOpen ? "rotate-180" : "rotate-0"}`} />
                                    </h3>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isBasicFiltersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-3 pt-2 space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Traitement
                                            </label>
                                            <CustomSelect
                                                value={filters.traite || ''}
                                                onChange={(value) => onFilterChange('traite', value)}
                                                placeholder="Tous les traitements"
                                                options={[
                                                    { value: 'OUI', label: 'Traité' },
                                                    { value: 'NON', label: 'Non traité' }
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Certification
                                            </label>
                                            <CustomSelect
                                                value={filters.certif || ''}
                                                onChange={(value) => onFilterChange('certif', value)}
                                                placeholder="Toutes les certifications"
                                                options={[
                                                    { value: 'OUI', label: 'Certifié' },
                                                    { value: 'NON', label: 'Non certifié' }
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Couverture
                                            </label>
                                            <CustomSelect
                                                value={filters.couverture || ''}
                                                onChange={(value) => onFilterChange('couverture', value)}
                                                placeholder="Toutes les couvertures"
                                                options={[
                                                    { value: 'O', label: 'Avec couverture' },
                                                    { value: 'N', label: 'Sans couverture' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specialized Cascading Filters Accordion */}
                            <div className="rounded-lg">
                                <button
                                    onClick={() => setIsSpecializedFiltersOpen(!isSpecializedFiltersOpen)}
                                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-200 rounded-t-lg"
                                >
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                            Filtres spécialisés
                                        </div>
                                        <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${!isSpecializedFiltersOpen ? "rotate-180" : "rotate-0"}`} />
                                    </h3>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isSpecializedFiltersOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-3 pt-2 space-y-4">
                                        <AccordionCheckbox
                                            label="Culture"
                                            options={cultureOptions}
                                            selectedValues={filters.codcul || []}
                                            onChange={(values) => onFilterChange('codcul', values)}
                                            placeholder="Aucune culture disponible"
                                        />

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Groupe Variété
                                            </label>
                                            <CustomSelect
                                                value={filters.codgrpvar || ''}
                                                onChange={(value) => onFilterChange('codgrpvar', value)}
                                                disabled={(filters.codcul || []).length === 0}
                                                placeholder="Tous les groupes variétés"
                                                options={cascadingOptions.groupeVarietes?.map(gv => ({
                                                    value: gv.codgrpvar,
                                                    label: gv.nomgrpvar || gv.codgrpvar
                                                })) || []}
                                            />
                                        </div>

                                        <AccordionCheckbox
                                            label="Variété"
                                            options={varieteOptions}
                                            selectedValues={filters.codvar || []}
                                            onChange={(values) => onFilterChange('codvar', values)}
                                            disabled={(filters.codcul || []).length === 0}
                                            placeholder="Aucune variété disponible"
                                        />

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Sous-Variété
                                            </label>
                                            <CustomSelect
                                                value={filters.codsvar || ''}
                                                onChange={(value) => onFilterChange('codsvar', value)}
                                                disabled={(filters.codvar || []).length === 0}
                                                placeholder="Toutes les sous-variétés"
                                                options={cascadingOptions.sousVarietes?.map(sv => ({
                                                    value: sv.codsvar,
                                                    label: sv.nomsvar || sv.codsvar
                                                })) || []}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Vergers
                                            </label>
                                            <CustomSelect
                                                value={filters.refver || ''}
                                                onChange={(value) => onFilterChange('refver', value)}
                                                placeholder="Tous les vergers"
                                                options={filterOptions.vergers?.map(v => ({
                                                    value: v.refver,
                                                    label: v.nomver || v.refver
                                                })) || []}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="border-t border-gray-200 bg-gray-50">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    Filtres actifs
                                </span>
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Réinitialiser
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {/* Multi-select Culture filter tags */}
                                {(filters.codcul || []).map(codcul => {
                                    const culture = cultureOptions.find(c => c.value === codcul);
                                    return (
                                        <span key={codcul} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                                            Culture: {culture?.label || codcul}
                                            <button
                                                onClick={() => {
                                                    const newValues = (filters.codcul || []).filter(v => v !== codcul);
                                                    onFilterChange('codcul', newValues);
                                                }}
                                                className="hover:text-blue-900 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    );
                                })}

                                {/* Multi-select Variete filter tags */}
                                {(filters.codvar || []).map(codvar => {
                                    const variete = varieteOptions.find(v => v.value === codvar);
                                    return (
                                        <span key={codvar} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium border border-green-200">
                                            Variété: {variete?.label || codvar}
                                            <button
                                                onClick={() => {
                                                    const newValues = (filters.codvar || []).filter(v => v !== codvar);
                                                    onFilterChange('codvar', newValues);
                                                }}
                                                className="hover:text-green-900 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    );
                                })}

                                {/* Single-select filters */}
                                {filters.codsvar && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium border border-purple-200">
                                        Sous-Variété: {filters.codsvar}
                                        <button
                                            onClick={() => onFilterChange('codsvar', '')}
                                            className="hover:text-purple-900 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {filters.refver && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium border border-amber-200">
                                        Verger: {filters.refver}
                                        <button
                                            onClick={() => onFilterChange('refver', '')}
                                            className="hover:text-amber-900 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {/* Basic filters tags */}
                                {filters.traite && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium border border-gray-200">
                                        Traitement: {filters.traite === 'OUI' ? 'Traité' : 'Non traité'}
                                        <button
                                            onClick={() => onFilterChange('traite', '')}
                                            className="hover:text-gray-900 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {filters.certif && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium border border-gray-200">
                                        Certification: {filters.certif === 'OUI' ? 'Certifié' : 'Non certifié'}
                                        <button
                                            onClick={() => onFilterChange('certif', '')}
                                            className="hover:text-gray-900 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {filters.couverture && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium border border-gray-200">
                                        Couverture: {filters.couverture === 'O' ? 'Avec couverture' : 'Sans couverture'}
                                        <button
                                            onClick={() => onFilterChange('couverture', '')}
                                            className="hover:text-gray-900 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterSidebar;
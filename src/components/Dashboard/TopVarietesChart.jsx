import { useState, useEffect } from 'react';
import { TrendingUp, Package, AlertCircle } from 'lucide-react';
import DashboardService from '../../services/dashboardService';

const TopVarietesChart = () => {
    const [topVarietes, setTopVarietes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('export');

    useEffect(() => {
        const fetchTopVarietes = async () => {
            try {
                setLoading(true);
                const data = await DashboardService.getTopVarietes(selectedType, 8);
                setTopVarietes(data);
            } catch (error) {
                console.error('Error fetching top varietes:', error);
                setTopVarietes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopVarietes();
    }, [selectedType]);

    const formatNumber = (number) => {
        if (number == null) return '0';
        return Number(number).toLocaleString('fr-FR');
    };

    const getMaxValue = () => {
        return Math.max(...topVarietes.map(v => v.valeur || 0));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'export':
                return <TrendingUp className="w-4 h-4" />;
            case 'stock':
                return <Package className="w-4 h-4" />;
            case 'freinte':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <TrendingUp className="w-4 h-4" />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'export':
                return 'bg-blue-500';
            case 'stock':
                return 'bg-green-500';
            case 'freinte':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="h-3 bg-gray-200 rounded flex-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    {getIcon(selectedType)}
                    <h3 className="text-lg font-semibold">Top Variétés</h3>
                </div>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="export">Export</option>
                    <option value="stock">Stock</option>
                    <option value="freinte">Freinte</option>
                </select>
            </div>

            <div className="space-y-4">
                {topVarietes.length > 0 ? (
                    topVarietes.map((variete, index) => {
                        const percentage = ((variete.valeur || 0) / getMaxValue()) * 100;
                        return (
                            <div key={variete.codvar} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                        {variete.nomVariete}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatNumber(variete.valeur)} kg
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getColor(selectedType)} transition-all duration-300`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Aucune donnée disponible</p>
                    </div>
                )}
            </div>

            {topVarietes.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                    <div className="text-xs text-gray-500">
                        Total {selectedType}: {formatNumber(topVarietes.reduce((sum, v) => sum + (v.valeur || 0), 0))} kg
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopVarietesChart;
import { useEffect, useState } from 'react'
import API from '../../../../utils/Api';
import Modal from "../../../../components/ui/Modal"
import { Pen, Trash2 } from 'lucide-react';

function ProtocoleTab({ id, parcelle }) {
    const [protocoles, setProtocoles] = useState([]);
    const [ParProtocoles, setParProtocoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddLoading, setIsAddLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProtocole, setSelectedProtocole] = useState(null);

    // Form data for edit/add
    const [formData, setFormData] = useState({
        dtDebut: '',
        dtFin: '',
        idPro: ''
    });

    // Charger les données depuis l'API
    const fetchProtocoles = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await API.get("/Protocoles");
            console.log(res)

            if (res.data && Array.isArray(res.data)) {
                setProtocoles(res.data);
            } else {
                setProtocoles(res.data ? [res.data] : []);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des protocoles:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Échec de la récupération des données',
                status: err.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    // Charger les données depuis l'API
    const fetchParProtocoles = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await API.get(`/ParProtocole/ByParcelle/${id}`);
            console.log(res)

            if (res.data && Array.isArray(res.data)) {
                setParProtocoles(res.data);
            } else {
                setParProtocoles(res.data ? [res.data] : []);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des protocoles:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Échec de la récupération des données',
                status: err.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    // Charger les données au montage du composant
    useEffect(() => {
        fetchProtocoles();
        fetchParProtocoles();
    }, []);

    // Fonction pour formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    // Fonction pour formater les dates pour les inputs
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    // Ouvrir le modal d'édition
    const handleEdit = (protocole) => {
        setSelectedProtocole(protocole);
        setFormData({
            dtDebut: formatDateForInput(protocole.dtDebut),
            dtFin: formatDateForInput(protocole.dtFin),
            idPro: protocole.idPro
        });
        setIsEditModalOpen(true);
    };

    // Ouvrir le modal de suppression
    const handleDelete = (protocole) => {
        setSelectedProtocole(protocole);
        setIsDeleteModalOpen(true);
    };

    // Ouvrir le modal d'ajout
    const handleAdd = () => {
        setFormData({
            dtDebut: '',
            dtFin: '',
            idPro: ''
        });
        setIsAddModalOpen(true);
    };

    // Sauvegarder les modifications
    const handleSave = async () => {
        try {
            setIsAddLoading(true);
            const dataToSend = {
                dateDebut: new Date(formData.dtDebut).toISOString(),
                dateFin: new Date(formData.dtFin).toISOString(),
                idParcelle: parseInt(id),
                idProtocole: parseInt(formData.idPro)
            };

            if (selectedProtocole) {
                console.log(selectedProtocole)

                const dataToUpdate = {
                    ...formData,
                    dtDebut: new Date(formData.dtDebut).toISOString(),
                    dtFin: new Date(formData.dtFin).toISOString(),
                    idPar: id,
                    idPro: parseInt(formData.idPro),
                    protocole: selectedProtocole.protocole,
                    parcelle: {
                        ...parcelle,
                        lier: "1",
                    }
                };

                // Update
                await API.put(`/ParProtocole/${selectedProtocole.id}`, dataToUpdate);
            } else {
                // Create
                await API.post('/ParProtocole/AffectProtocoleToParcelle', dataToSend);
            }

            // Recharger les données
            await fetchParProtocoles();

            // Fermer les modals
            setIsEditModalOpen(false);
            setIsAddModalOpen(false);
            setSelectedProtocole(null);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde',
                status: err.response?.status
            });
        } finally {
            setIsAddLoading(false);
        }
    };


    // Confirmer la suppression
    const confirmDelete = async () => {
        try {
            setIsDeleteLoading(true);
            const res = await API.delete(`/ParProtocole/${selectedProtocole.id}`);

            console.log(res)

            // Recharger les données
            await fetchParProtocoles();

            // Fermer le modal
            setIsDeleteModalOpen(false);
            setSelectedProtocole(null);
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la suppression',
                status: err.response?.status
            });
        } finally {
            setIsDeleteLoading(false);
        }
    };

    // Gérer les changements du formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-gray-600">Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">Erreur: {error.message}</p>
                {error.status && <p className="text-red-500 text-sm">Status: {error.status}</p>}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Protocoles de la Parcelle</h2>
                <button
                    onClick={handleAdd}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    Ajouter un Protocole
                </button>
            </div>

            {ParProtocoles.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun protocole trouvé pour cette parcelle.</p>
                </div>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Protocole
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date de Début
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date de Fin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID Parcelle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {ParProtocoles.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                            {item.protocole?.libelle || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(item.dtDebut)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(item.dtFin)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.idPar}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {/* <button
                                                onClick={() => handleEdit(item)}
                                                className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50 transition-colors"
                                                title="Modifier"
                                            >
                                                <Pen size={20} />

                                            </button> */}
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Statistiques */}
            <div className="mt-4 text-sm text-gray-600">
                Total: {ParProtocoles.length} protocole(s)
            </div>

            {/* Modal d'édition */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProtocole(null);
                }}
                className="max-w-md mx-4 p-6"
            >
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Modifier le Protocole
                    </h3>
                    <p className="text-sm text-gray-600">
                        Protocole: {selectedProtocole?.protocole?.libelle}
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Protocole
                        </label>
                        <select
                            name="idPro"
                            value={formData.idPro}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Sélectionner un protocole</option>
                            {protocoles.map(protocole => (
                                <option key={protocole.id} value={protocole.id}>
                                    {protocole.libelle}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de Début
                        </label>
                        <input
                            type="date"
                            name="dtDebut"
                            value={formData.dtDebut}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de Fin
                        </label>
                        <input
                            type="date"
                            name="dtFin"
                            value={formData.dtFin}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={() => {
                            setIsEditModalOpen(false);
                            setSelectedProtocole(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isAddLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${isAddLoading
                            ? 'bg-primary-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                    >
                        {isAddLoading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isAddLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </Modal>

            {/* Modal d'ajout */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                className="max-w-md mx-4 p-6"
            >
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ajouter un Protocole
                    </h3>
                    <p className="text-sm text-gray-600">
                        Ajouter un nouveau protocole à cette parcelle
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Protocole *
                        </label>
                        <select
                            name="idPro"
                            value={formData.idPro}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">Sélectionner un protocole</option>
                            {protocoles.map(protocole => (
                                <option key={protocole.id} value={protocole.id}>
                                    {protocole.libelle}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de Début *
                        </label>
                        <input
                            type="date"
                            name="dtDebut"
                            value={formData.dtDebut}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de Fin *
                        </label>
                        <input
                            type="date"
                            name="dtFin"
                            value={formData.dtFin}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isAddLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${isAddLoading
                                ? 'bg-primary-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                    >
                        {isAddLoading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isAddLoading ? 'Ajout en cours...' : 'Ajouter'}
                    </button>

                </div>
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProtocole(null);
                }}
                className="max-w-md mx-4 p-6"
            >
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Confirmer la suppression
                            </h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        Êtes-vous sûr de vouloir supprimer ce protocole ? Cette action est irréversible.
                    </p>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-800">
                            Protocole: {selectedProtocole?.protocole?.libelle}
                        </p>
                        <p className="text-sm text-gray-600">
                            Période: {formatDate(selectedProtocole?.dtDebut)} - {formatDate(selectedProtocole?.dtFin)}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            setIsDeleteModalOpen(false);
                            setSelectedProtocole(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={confirmDelete}
                        disabled={isDeleteLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${isDeleteLoading
                            ? 'bg-red-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        {isDeleteLoading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isDeleteLoading ? 'Suppression...' : 'Supprimer'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default ProtocoleTab
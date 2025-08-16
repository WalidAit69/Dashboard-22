import { useState, useEffect } from 'react';
import { X, Building, MapPin, Phone, Mail, Globe, Power } from 'lucide-react';
import Modal from '../ui/Modal';

const OrganismeModal = ({ isOpen, onClose, onSave, organisme }) => {
    const [formData, setFormData] = useState({
        nomOrganisme: '',
        adresse: '',
        telephone: '',
        email: '',
        siteWeb: '',
        actif: true
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (organisme) {
            setFormData({
                nomOrganisme: organisme.nomOrganisme || '',
                adresse: organisme.adresse || '',
                telephone: organisme.telephone || '',
                email: organisme.email || '',
                siteWeb: organisme.siteWeb || '',
                actif: organisme.actif !== undefined ? organisme.actif : true
            });
        } else {
            setFormData({
                nomOrganisme: '',
                adresse: '',
                telephone: '',
                email: '',
                siteWeb: '',
                actif: true
            });
        }
        setErrors({});
    }, [organisme, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nomOrganisme.trim()) {
            newErrors.nomOrganisme = 'Le nom de l\'organisme est requis';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Veuillez saisir une adresse email valide';
        }

        if (formData.siteWeb && !/^https?:\/\/.+/.test(formData.siteWeb)) {
            newErrors.siteWeb = 'Veuillez saisir une URL valide (http:// ou https://)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const dataToSave = {
                nomOrganisme: formData.nomOrganisme.trim(),
                adresse: formData.adresse.trim() || null,
                telephone: formData.telephone.trim() || null,
                email: formData.email.trim() || null,
                siteWeb: formData.siteWeb.trim() || null,
                actif: formData.actif
            };

            await onSave(dataToSave);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {organisme ? 'Modifier l\'organisme' : 'Nouvel organisme'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {organisme ? 'Modifiez les informations de l\'organisme' : 'Ajoutez un nouvel organisme de certification'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                    {/* Nom de l'organisme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building className="inline w-4 h-4 mr-1" />
                            Nom de l'organisme *
                        </label>
                        <input
                            type="text"
                            name="nomOrganisme"
                            value={formData.nomOrganisme}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.nomOrganisme ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Ex: Ecocert, Bureau Veritas, SGS..."
                        />
                        {errors.nomOrganisme && <p className="text-red-500 text-xs mt-1">{errors.nomOrganisme}</p>}
                    </div>

                    {/* Adresse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" />
                            Adresse
                        </label>
                        <textarea
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Adresse complète de l'organisme..."
                        />
                    </div>

                    {/* Téléphone et Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="inline w-4 h-4 mr-1" />
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Ex: +33 1 23 45 67 89"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="inline w-4 h-4 mr-1" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="contact@organisme.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Site Web */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Globe className="inline w-4 h-4 mr-1" />
                            Site Web
                        </label>
                        <input
                            type="url"
                            name="siteWeb"
                            value={formData.siteWeb}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.siteWeb ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="https://www.organisme.com"
                        />
                        {errors.siteWeb && <p className="text-red-500 text-xs mt-1">{errors.siteWeb}</p>}
                    </div>

                    {/* Statut Actif/Inactif - Toujours visible */}
                    <div>
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Power className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Statut de l'organisme</span>
                            </div>
                            <div className="flex items-center ml-auto">
                                <input
                                    type="checkbox"
                                    name="actif"
                                    checked={formData.actif}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${formData.actif ? 'bg-primary-500' : 'bg-gray-200'
                                    }`}>
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.actif ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </div>
                                <span className={`ml-3 text-sm font-medium ${formData.actif ? 'text-primary-600' : 'text-gray-500'
                                    }`}>
                                    {formData.actif ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                            Les organismes inactifs ne pourront pas émettre de nouveaux certificats
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {organisme ? 'Modifier' : 'Créer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default OrganismeModal;
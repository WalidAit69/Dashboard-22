import { useState, useEffect } from 'react';
import { X, Building, MapPin, Phone, Mail, Globe } from 'lucide-react';
import Modal from '../ui/Modal';

const OrganismeModal = ({ isOpen, onClose, onSave, organisme }) => {
    const [formData, setFormData] = useState({
        nomOrganisme: '',
        adresse: '',
        telephone: '',
        email: '',
        siteWeb: ''
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
                siteWeb: organisme.siteWeb || ''
            });
        } else {
            setFormData({
                nomOrganisme: '',
                adresse: '',
                telephone: '',
                email: '',
                siteWeb: ''
            });
        }
        setErrors({});
    }, [organisme, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
                siteWeb: formData.siteWeb.trim() || null
            };

            await onSave(dataToSave);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-green-600" />
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                errors.nomOrganisme ? 'border-red-500' : 'border-gray-300'
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                errors.siteWeb ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="https://www.organisme.com"
                        />
                        {errors.siteWeb && <p className="text-red-500 text-xs mt-1">{errors.siteWeb}</p>}
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
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import serviceService from '../../services/api/serviceService';
import { Service } from '../../types';
import showToast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    serviceId: '',
    serviceName: '',
    loading: false,
  });

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await serviceService.getMyServices();
      setServices(response.data);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load services';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, title: string) => {
    console.log('🔵 DELETE BUTTON CLICKED');
    console.log('Service ID:', id);
    console.log('Service Title:', title);
    
    setDeleteModal({
      isOpen: true,
      serviceId: id,
      serviceName: title,
      loading: false,
    });
    
    console.log('🔵 Modal state set to open');
  };

  const closeDeleteModal = () => {
    console.log('🔴 CLOSING MODAL');
    setDeleteModal({
      isOpen: false,
      serviceId: '',
      serviceName: '',
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    console.log('🟢 CONFIRM BUTTON CLICKED IN MODAL');
    console.log('Deleting service:', deleteModal.serviceId);
    
    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      console.log('📤 Calling API...');
      await serviceService.deleteService(deleteModal.serviceId);
      
      console.log('✅ API Success - Removing from state');
      setServices(services.filter(s => s._id !== deleteModal.serviceId));
      
      console.log('✅ Showing success toast');
      showToast.success('Service deleted successfully!');
      
      closeDeleteModal();
    } catch (err: any) {
      console.error('❌ DELETE FAILED:', err);
      showToast.error(err.message || 'Failed to delete service');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = () => {
    logout();
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];

  const stats = {
    total: services.length,
    active: services.filter(s => s.status === 'active').length,
    inactive: services.filter(s => s.status === 'inactive').length,
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}!</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/vendor/create-service')}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Add Service</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 text-sm font-medium">Total Services</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 text-sm font-medium">Active Services</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 text-sm font-medium">Inactive Services</p>
              <p className="text-3xl font-bold text-gray-400 mt-2">{stats.inactive}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          )}

          {!loading && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onEdit={() => navigate(`/vendor/edit-service/${service._id}`)}
                  onDelete={() => openDeleteModal(service._id, service.title)}
                />
              ))}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'No services match your filters'
                  : 'No services yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first service'}
              </p>
              <button
                onClick={() => navigate('/vendor/create-service')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Service
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal OUTSIDE main div */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteModal.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteModal.loading}
      />
    </>
  );
};

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      
      {/* Service Image */}
      <div className="aspect-square w-full bg-gray-100 overflow-hidden">
        {service.imageUrl ? (
          <img 
            src={`http://localhost:5000${service.imageUrl}`}
            alt={service.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.currentTarget;
              target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">{service.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            service.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {service.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold text-gray-900">Rs.{service.price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold text-gray-900">{service.duration} min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Category:</span>
            <span className="font-semibold text-gray-900">{service.category}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
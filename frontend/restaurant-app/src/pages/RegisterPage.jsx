import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Upload, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { restaurantsAPI } from '../services/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    restaurant_name: '',
    description: '',
    cuisine_type: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    restaurant_phone: '',
    latitude: null,
    longitude: null
  });

  const [docs, setDocs] = useState({
    business_license: null,
    food_safety_certificate: null,
    owner_id_proof: null,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchLocation = () => {
    setFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));

        setFetchingLocation(false);
        toast.success('Location captured successfully!');
      },
      () => {
        setFetchingLocation(false);
        toast.error('Please allow location permission.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.phone_number.startsWith('+')) {
      toast.error('Phone number must be in format +919876543210');
      return;
    }

    setLoading(true);

    try {
      // STEP 1 - Register user
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: 'restaurant'
      });

      // STEP 2 - Create restaurant
      const restaurantData = new FormData();

      restaurantData.append('name', formData.restaurant_name);
      restaurantData.append('description', formData.description);
      restaurantData.append('cuisine_type', formData.cuisine_type);
      restaurantData.append('address', formData.address);
      restaurantData.append('city', formData.city);
      restaurantData.append('state', formData.state);
      restaurantData.append('pincode', formData.pincode);
      restaurantData.append(
        'phone',
        formData.restaurant_phone || formData.phone_number
      );

      restaurantData.append(
        'slug',
        formData.restaurant_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );

      if (docs.business_license) {
        restaurantData.append(
          'business_license',
          docs.business_license
        );
      }

      if (docs.food_safety_certificate) {
        restaurantData.append(
          'food_safety_certificate',
          docs.food_safety_certificate
        );
      }

      if (docs.owner_id_proof) {
        restaurantData.append(
          'owner_id_proof',
          docs.owner_id_proof
        );
      }

      if (formData.latitude) {
        restaurantData.append('latitude', formData.latitude);
      }

      if (formData.longitude) {
        restaurantData.append('longitude', formData.longitude);
      }

      await restaurantsAPI.createRestaurant(restaurantData);

      toast.success('Restaurant account created successfully!');
      navigate('/', { replace: true });

    } catch (err) {
      console.log('REGISTER ERROR:', err.response?.data);

      toast.error(
        JSON.stringify(err.response?.data) ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const FileField = ({ label, name }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: 'block',
        fontSize: '0.8rem',
        marginBottom: 6,
        fontWeight: 700
      }}>
        {label}
      </label>

      <label
        className="input"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <span>
          {docs[name]?.name || 'Choose file'}
        </span>

        <span style={{ display: 'flex', gap: 6 }}>
          <Upload size={16} />
          Upload
        </span>

        <input
          type="file"
          accept="image/*,.pdf"
          hidden
          onChange={(e) =>
            setDocs({
              ...docs,
              [name]: e.target.files?.[0] || null
            })
          }
        />
      </label>
    </div>
  );

  return (
    <div className="auth-shell">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
        style={{ maxWidth: 560 }}
      >
        <h1>Create Restaurant Account</h1>

        <form onSubmit={handleRegister}>
          <input
            className="input"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="phone_number"
            placeholder="+919876543210"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="password"
            name="password_confirm"
            placeholder="Confirm Password"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="restaurant_name"
            placeholder="Restaurant Name"
            value={formData.restaurant_name}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            onClick={fetchLocation}
            disabled={fetchingLocation}
          >
            {fetchingLocation
              ? 'Fetching...'
              : 'Fetch Location'}
          </button>

          <FileField
            label="Business License"
            name="business_license"
          />

          <FileField
            label="Food Safety Certificate"
            name="food_safety_certificate"
          />

          <FileField
            label="Owner ID Proof"
            name="owner_id_proof"
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating...'
              : 'Create Account'}{' '}
            <ArrowRight size={18} />
          </button>
        </form>

        <p>
          Already have account?{' '}
          <Link to="/login">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

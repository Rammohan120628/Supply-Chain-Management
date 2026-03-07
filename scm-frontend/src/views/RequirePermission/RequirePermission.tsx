import { Navigate } from 'react-router-dom';
import { usePermissions, PermissionsData } from '../../context/PermissionContext/PermissionContext';

interface RequirePermissionProps {
  permissionKey: keyof PermissionsData;
  children: JSX.Element;
  fallbackPath?: string;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({
  permissionKey,
  children,
  fallbackPath = '/unauthorized',
}) => {
  const { permissions, loading } = usePermissions();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading permissions...</div>;
  }

  if (!permissions || !permissions[permissionKey]) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RequirePermission;
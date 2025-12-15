import { Camera } from 'expo-camera';
import { useEffect, useState } from 'react';

export interface CameraState {
  hasPermission: boolean | null;
  isRequesting: boolean;
  error: string | null;
}

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    hasPermission: null,
    isRequesting: false,
    error: null,
  });

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      setState({
        hasPermission: status === 'granted',
        isRequesting: false,
        error: null,
      });
    } catch (error) {
      setState({
        hasPermission: false,
        isRequesting: false,
        error: 'Failed to check camera permission',
      });
    }
  };

  const requestPermission = async () => {
    try {
      setState(prev => ({ ...prev, isRequesting: true }));
      
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      setState({
        hasPermission: status === 'granted',
        isRequesting: false,
        error: status !== 'granted' ? 'Camera permission denied' : null,
      });

      return status === 'granted';
    } catch (error) {
      setState({
        hasPermission: false,
        isRequesting: false,
        error: 'Failed to request camera permission',
      });
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
  };
}


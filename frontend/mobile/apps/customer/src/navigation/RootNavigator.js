import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@pecafoo/auth';
import { LoadingScreen } from '@pecafoo/ui';
import { colors } from '@pecafoo/theme';

import AuthStack from './AuthStack';
import RoleStack from './RoleStack';
import MainTabs from './MainTabs';

const RootNavigator = () => {
  const { isAuthenticated, loading, pendingLogin } = useAuth();

  if (loading) {
    return <LoadingScreen color={colors.brand.customer} />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated && !pendingLogin && <AuthStack />}
      {!isAuthenticated && pendingLogin && <RoleStack />}
      {isAuthenticated && <MainTabs />}
    </NavigationContainer>
  );
};

export default RootNavigator;

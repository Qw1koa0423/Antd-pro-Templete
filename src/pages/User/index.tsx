import { PageContainer } from '@ant-design/pro-layout';
import { Outlet } from '@umijs/max';
import React from 'react';

const User: React.FC = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default User;

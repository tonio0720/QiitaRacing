import React from 'react';

import {
    Layout,
} from 'antd';

const {
    Content,
    Footer
} = Layout;

const BasicLayout = ({
    children,
}) => {
    return (
        <Layout>
            <Content style={{ padding: '0 50px' }}>
                <div style={{ padding: 24, minHeight: 'calc(100vh)' }}>
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>©React App</Footer>
        </Layout>
    );
};

export default BasicLayout;

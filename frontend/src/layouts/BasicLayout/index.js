import React from 'react';

import {
    Layout
} from 'antd';

import styles from './index.module.less';

const {
    Header,
    Content,
    Footer
} = Layout;

const BasicLayout = ({
    children
}) => {
    return (
        <Layout>
            <Header className={styles.header}>
                <div className={styles.logo} />
            </Header>
            <Content style={{ padding: '0 50px' }}>
                <div style={{ padding: 24, minHeight: 'calc(100vh - 64px  - 69px)' }}>
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>©React App</Footer>
        </Layout>
    );
};

export default BasicLayout;

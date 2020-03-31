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
                {/* <div className={styles.logo} /> */}
                <div className={styles.title}>Qiita Racer</div>
            </Header>
            <Content>
                <div style={{ padding: 24, minHeight: 'calc(100vh - 64px  - 69px)' }}>
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>©React App</Footer>
        </Layout>
    );
};

export default BasicLayout;

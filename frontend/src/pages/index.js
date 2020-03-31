import React, {
    useEffect, useRef, useCallback, useState
} from 'react';
import {
    Button, Input, Row, Col
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import Layout from '@/layouts/BasicLayout';
import RacingBarChart from '@/components/RacingBarChart';
import rawData from './data.json';

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

const token = '697c2ec6b9b7256e904120b7f59dba81d21bd507';

async function getAllItems(id) {
    const limit = 100;
    let page = 1;

    let totalCnt;
    let items = [];

    let current;
    do {
        const response = await fetch(`https://qiita.com/api/v2/users/${id}/items?page=${page}&per_page=${limit}`, {
            mode: 'cors',
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Headers': 'total-count',
                'Access-Control-Expose-Headers': 'total-count'
            },
        });

        current = await response.json();
        items = items.concat(current);
        page++;
    } while (limit === current.length);

    return items;
}

async function getAllLikes(itemId) {
    const limit = 100;
    let page = 1;

    let totalCnt;
    let items = [];

    let current;
    do {
        const response = await fetch(`https://qiita.com/api/v2/items/${itemId}/likes?page=${page}&per_page=${limit}`, {
            mode: 'cors',
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Headers': 'total-count',
                'Access-Control-Expose-Headers': 'total-count'
            }
        });

        current = await response.json();
        items = items.concat(current);
        page++;
    } while (limit === current.length);

    return items;
}

const fetchData = async (users) => {
    const data = {};
    await Promise.all(users.map(async (userId) => {
        const items = await getAllItems(userId);
        let totalLikes = [];
        await Promise.all(items.map(async (item) => {
            const likes = await getAllLikes(item.id);
            totalLikes = totalLikes.concat(likes);
        }));
        totalLikes.forEach(({ created_at: createdAt }) => {
            const date = moment(createdAt).format('YYYY-MM-DD');
            if (!data[date]) {
                data[date] = {};
            }
            if (!data[date][userId]) {
                data[date][userId] = 0;
            }
            data[date][userId]++;
        });
    }));

    const emptyData = {};
    users.forEach((user) => {
        emptyData[user] = 0;
    });

    const datesData = [];
    Object.keys(data).forEach((date) => {
        datesData.push({
            date,
            likeCounts: { ...emptyData, ...data[date] }
        });
    });

    datesData.sort((a, b) => moment(a.date) - moment(b.date));

    return datesData;
};

const userCount = 8;

export default () => {
    const [users, setUsers] = useState(Array(userCount).fill(null));
    const [validUsers, setValidUsers] = useState(null);
    const [data, setData] = useState(null);
    const ref = useRef(null);

    return (
        <Layout>
            <Row gutter={8}>
                {users.map((user, i) => {
                    return (
                        <Col key={i} span={6} style={{ marginBottom: 8 }}>
                            <Input
                                value={user}
                                onChange={(e) => {
                                    const updatedUsers = [...users];
                                    updatedUsers[i] = e.target.value;
                                    setUsers(updatedUsers);
                                }}
                            />
                        </Col>
                    );
                })}
            </Row>
            <div style={{ textAlign: 'right' }}>
                <Button
                    onClick={async () => {
                        const validUsers = users.filter((n) => n);
                        const data = await fetchData(validUsers);
                        console.log(data);
                        setData(data);
                        setValidUsers(validUsers);
                    }}
                >
                    取得
                </Button>
                <Button
                    onClick={() => {
                        ref.current.play();
                    }}
                    disabled={!data}
                >
                    実行
                </Button>
            </div>
            <div style={{ width: '100%', height: 500 }}>
                <RacingBarChart ref={ref} data={data} users={validUsers} />
            </div>
        </Layout>
    );
};

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react';
import {
    Icon,
    Slider,
    Spin
} from 'antd';
import RacingBarChart from '@/components/RacingBarChart';

import styles from './index.module.less';

const colors = [
    '#1890ff',
    '#fa8c16',
    '#52c41a',
    '#f5222d',
    '#722ed1',
    '#eb2f96',
    '#a0d911',
    '#13c2c2',
];

export default ({
    data,
    users,
    loading,
}) => {
    const ref = useRef(null);
    const playid = useRef(0);

    const [sliderValue, setSliderValue] = useState(0);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (!users) {
            return;
        }

        const user2Color = {};
        users.forEach((user, i) => {
            user2Color[user] = colors[i];
        });
        ref.current.user2Color = user2Color;
    }, [users]);

    useEffect(() => {
        if (!ref.current) {
            return;
        }
        ref.current.moveToDate({});
    }, [ref]);

    useEffect(() => {
        if (playing || !data) {
            return;
        }
        const { likeCounts } = data[sliderValue];
        ref.current.moveToDate(likeCounts);
    }, [sliderValue]);

    const play = useCallback(async () => {
        if (!data) {
            return;
        }

        setPlaying(true);
        const pid = ++playid.current;

        let i = sliderValue;
        if (i === data.length - 1) {
            i = 0;
        }
        while (i < data.length) {
            if (pid !== playid.current) {
                setPlaying(false);
                return;
            }
            const { likeCounts } = data[i];
            setSliderValue(i);
            await ref.current.moveToDate(likeCounts);
            i++;
        }
        setPlaying(false);
    }, [data, sliderValue]);

    useEffect(() => {
        setSliderValue(0);
        if (data && loading) {
            play();
        }
    }, [data, loading]);

    return (
        <Spin spinning={loading}>
            <div style={{ background: '#fff', padding: 16, marginTop: 16 }}>
                <h2 style={{ textAlign: 'center' }}>
                    {data && data[sliderValue] && data[sliderValue].date}
                </h2>
                <RacingBarChart ref={ref} />
                <div className={styles.iconWrapper}>
                    {
                        !playing && (
                            <Icon
                                className={styles.play}
                                type="caret-right"
                                onClick={play}
                                disabled={!data}
                            />
                        )
                    }
                    {
                        playing && (
                            <Icon
                                className={styles.play}
                                type="pause"
                                onClick={async () => {
                                    if (!data) {
                                        return;
                                    }
                                    playid.current++;
                                    setPlaying(false);
                                }}
                                disabled={!data}
                            />
                        )
                    }
                    <Slider
                        min={0}
                        max={data ? data.length - 1 : 0}
                        value={sliderValue}
                        onChange={(sliderValue) => {
                            playid.current++;
                            setSliderValue(sliderValue);
                        }}
                        tipFormatter={(n) => {
                            if (!data) {
                                return null;
                            }
                            return data[n].date;
                        }}
                    />
                </div>
            </div>
        </Spin>
    );
};

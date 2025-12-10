/**
 * Railroad Layout Visualization Component
 * 
 * Interactive SVG diagram of Dennis's N gauge railroad layout with clickable track selection,
 * automatic switch control, and visual route highlighting for intuitive train operations.
 */

import { Button, useTheme } from '../ui'
import React, { Fragment, useState } from 'react'

import { LayoutComponentProps } from '../types';

/**
 * Interactive Railroad Layout Diagram
 * 
 * Features:
 * - SVG-based track diagram with precise geometry
 * - Clickable track elements for route selection
 * - Automatic switch throwing for selected routes
 * - Visual highlighting of active track paths
 * - Manual track selection buttons
 * 
 * Layout Structure:
 * - Track 0 (Loop): Main continuous running loop
 * - Track 1: Siding track accessed via Switch 1
 * - Track 2: Industrial spur via Switches 1,2,3
 * - Track 3: Yard track via Switches 1,2
 * 
 * Switch Logic:
 * - Switch 1: Diverts from loop to sidings
 * - Switch 2: Routes between Track 2 and Track 3
 * - Switch 3: Controls access to Track 2 spur
 * 
 * @param {LayoutComponentProps} props - Component props
 * @returns {React.JSX.Element} Interactive layout with track selection
 */
export default function Layout({ activeTrack: propActiveTrack, setActiveTrack: propSetActiveTrack }: LayoutComponentProps) {
    const theme = useTheme()
    const activeColor = theme.colors.trackActive
    const inactiveColor = theme.colors.trackInactive
    const [activeTrack, setActiveTrack] = useState(propActiveTrack || 0)

    const selectTrack = (track: number) => {
        window.electron.invoke('fireMacro', track as any)
            .then((res: unknown) => {
                setActiveTrack(track);
                propSetActiveTrack?.(track);
            })
            .catch((err: unknown) => console.error(err))
    }

    const track3 = (active?: boolean) => {
        let color = inactiveColor
        if (active) {
            color = activeColor
        }

        return (
            <g id="Track_3" data-name="Track 3" style={{ cursor: 'pointer' }} onClick={() => selectTrack(3)}>
                <line id="track3" x1="4563.03" y1="968.74" x2="3612.36" y2="1917.69" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                <polyline id="track3curve" points="3149.14 2156.84 3159.61 2154.65 3170.86 2152.38 3181.32 2150.12 3192.57 2147.93 3203.03 2145.67 3213.5 2143.4 3224.74 2140.43 3235.21 2137.47 3245.68 2134.42 3256.14 2131.45 3266.61 2127.7 3277.07 2124.74 3287.61 2120.99 3298.08 2117.24 3308.55 2113.49 3319.01 2109.82 3329.48 2105.29 3339.24 2101.54 3349.7 2097.09 3359.39 2092.56 3369.93 2088.11 3379.62 2083.66 3389.38 2078.42 3399.84 2073.19 3409.53 2067.96 3419.29 2062.72 3428.27 2057.49 3437.96 2052.26 3447.72 2046.24 3457.48 2041.01 3466.46 2035 3475.45 2029.06 3485.13 2023.05 3494.11 2016.33 3503.09 2010.4 3512.07 2003.6 3521.06 1997.67 3530.04 1990.95 3538.24 1984.23 3547.22 1976.74 3555.5 1970.02 3563.7 1962.52 3572.68 1955.81 3580.88 1948.31 3589.16 1940.89 3596.66 1933.39 3604.86 1925.89 3612.36 1917.69" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                <line id="track3ShortStraight" x1="2270.68" y1="2303.35" x2="3149.14" y2="2156.83" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
            </g>
        )
    }

    const track2 = (active?: boolean) => {
        let color = inactiveColor
        if (active) {
            color = activeColor
        }

        return (
            <g id="Track_2" data-name="Track 2" style={{ cursor: 'pointer' }} onClick={() => selectTrack(2)}>
                <line id="track2" x1="4390.19" y1="796.06" x2="3529.26" y2="1656.06" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                <polyline id="track2Curve" points="2270.68 2303.35 2300.59 2298.12 2329.8 2292.89 2358.93 2286.95 2388.14 2280.23 2418.05 2274.22 2446.48 2266.72 2475.69 2259.3 2504.9 2251.8 2534.03 2243.6 2562.46 2235.32 2590.89 2226.42 2619.39 2216.66 2647.82 2206.97 2676.25 2197.21 2704.68 2186.75 2732.32 2176.28 2760.05 2165.11 2787.7 2153.87 2815.42 2141.92 2843.07 2129.97 2870.01 2117.24 2896.96 2104.59 2923.9 2091.07 2950.85 2077.64 2977.01 2064.21 3003.96 2049.21 3030.2 2035 3055.58 2020.08 3081.82 2005.16 3107.28 1989.47 3132.66 1973.77 3158.13 1957.29 3182.8 1940.89 3207.49 1923.63 3232.24 1906.45 3256.14 1889.26 3280.82 1871.3 3304.8 1853.42 3327.99 1834.67 3351.19 1816.01 3374.38 1797.34 3397.58 1777.89 3420.07 1758.45 3442.49 1738.3 3464.9 1718.07 3486.61 1697.92 3508.33 1676.99 3529.26 1656.06" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
            </g>
        )
    }

    const track1 = (active?: boolean) => {

        let color = inactiveColor
        if (active) {
            color = activeColor
        }

        return (
            <g id="Track_1" data-name="Track 1" style={{ cursor: 'pointer' }} onClick={() => selectTrack(1)}>
                <line id="track1" x1="4293" y1="504.54" x2="3062.38" y2="1733.77" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                <polyline id="track1Curve" points="1803.71 2381.14 1833.63 2376.61 1862.84 2370.67 1892.05 2364.66 1921.18 2358.72 1950.39 2351.93 1979.6 2345.21 2008.73 2337.79 2037.94 2329.51 2066.37 2321.31 2095.57 2313.11 2124 2304.13 2152.43 2295.15 2180.86 2285.47 2209.29 2275 2237.01 2265.24 2265.44 2254.07 2293.09 2242.82 2320.82 2231.65 2348.46 2219.63 2376.19 2207.68 2403.13 2195.03 2430.08 2182.3 2456.94 2169.57 2483.89 2156.13 2510.13 2141.92 2537.07 2127.7 2563.24 2112.79 2588.7 2098.57 2614.86 2082.87 2640.32 2067.18 2665.78 2051.48 2691.16 2035 2715.92 2018.6 2740.6 2002.12 2765.28 1984.94 2789.26 1967.05 2813.94 1949.09 2837.13 1931.13 2861.03 1913.16 2884.23 1894.5 2907.42 1875.05 2930.62 1855.6 2953.11 1836.23 2975.53 1816.01 2998.02 1795.86 3019.73 1775.63 3041.37 1754.7 3062.38 1733.77" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
            </g>
        )
    }

    const track12or3 = (active?: boolean) => {
        let color = inactiveColor
        if (active) {
            color = activeColor
        }

        return (
            <g id="_1_2_or_3" data-name="1 2 or 3">
                <line x1="1750.61" y1="2390.12" x2="1803.72" y2="2381.14" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                <polyline points="1366.75 2422.22 1374.95 2422.22 1383.15 2422.22 1391.42 2422.22 1398.92 2422.22 1407.12 2421.51 1415.32 2421.51 1422.82 2421.51 1431.1 2421.51 1439.3 2420.73 1447.5 2420.73 1455 2420.73 1463.28 2419.95 1471.48 2419.95 1478.97 2419.25 1487.18 2419.25 1495.45 2418.47 1503.65 2418.47 1511.15 2417.77 1519.35 2416.99 1527.63 2416.28 1535.05 2416.28 1543.33 2415.5 1551.53 2414.72 1559.03 2414.02 1567.23 2413.24 1575.51 2412.53 1583.01 2411.75 1591.2 2411.05 1599.41 2410.27 1606.9 2409.49 1615.18 2408.78 1623.38 2408 1630.88 2407.3 1639.08 2406.52 1647.36 2405.04 1654.78 2404.26 1663.06 2403.55 1671.26 2402.07 1678.76 2401.29 1686.96 2399.8 1694.45 2399.02 1702.73 2397.54 1710.93 2396.84 1718.43 2395.35 1726.63 2393.79 1734.13 2393.09 1742.33 2391.6 1750.61 2390.12" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
            </g>
        )
    }

    const track2or3 = (active?: boolean) => {
        let color = inactiveColor
        if (active) {
            color = activeColor
        }

        return (
            <g id="_2_0r_3" data-name="2 0r 3">
                <line x1="2270.68" y1="2303.35" x2="1803.72" y2="2381.14" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
            </g>
        )
    }

    const trackLoop = (active?: boolean) => {
        let color = inactiveColor
        if (active) {
            color = activeColor
        }

        return (
            <g id="loopStraight" style={{ cursor: 'pointer' }} onClick={() => selectTrack(0)}>
                <line id="loopTrack" x1="3637.82" y1="2422.22" x2="1559.81" y2="2422.22" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                <line id="loopTrackShort" x1="1559.81" y1="2422.22" x2="1366.75" y2="2422.22" fill="none" stroke={color} strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
            </g>
        )
    }

    const makeTrack = (): React.ReactElement | undefined => {
        switch (activeTrack) {
            case 0:
                return (
                    <Fragment>
                        {track3()}
                        {track2()}
                        {track1()}
                        {track12or3()}
                        {track2or3()}
                        {trackLoop(true)}
                    </Fragment>
                )

            case 1:
                return (
                    <Fragment>
                        {track3()}
                        {track2()}
                        {track2or3()}
                        {trackLoop()}
                        {track1(true)}
                        {track12or3(true)}
                    </Fragment>
                )

            case 2:
                return (
                    <Fragment>
                        {track3()}
                        {trackLoop()}
                        {track1()}
                        {track12or3(true)}
                        {track2or3(true)}
                        {track2(true)}
                    </Fragment>
                )

            case 3:
                return (
                    <Fragment>
                        {trackLoop()}
                        {track1()}
                        {track2()}
                        {track12or3(true)}
                        {track2or3(true)}
                        {track3(true)}
                    </Fragment>
                )

            default:
                return undefined;
        }
    }

    const open = (switchNum: number) => {
        //console.log('Switch Open')
        window.electron.send('send-serial', [0xAD, 0x00, switchNum, 3, 0] as any)
    }

    const close = (switchNum: number) => {
        //console.log('Switch close')
        window.electron.send('send-serial', [0xAD, 0x00, switchNum, 4, 0] as any)
    }

    switch (activeTrack) {
        case 0:
            close(1)
            break;

        case 1:
            open(1)
            close(2)
            break;

        case 2:
            open(1)
            open(2)
            open(3)
            break;

        case 3:
            open(1)
            open(2)
            close(3)
            break;

        default:
            break;
    }

    const makeVariant = (num: number) => {
        if (activeTrack === num) return 'primary'
        else return 'secondary'
    }

    return (
        <div style={{ backgroundColor: theme.colors.background.medium, padding: theme.spacing.xs, width: '100%', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <svg id="TRACK" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4869.06 2463.71" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                <g id="Loop">
                    <line x1="1231.24" y1="2422.22" x2="1366.75" y2="2422.22" fill="none" stroke="#000" strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                    <line x1="1231.24" y1="41.5" x2="3637.82" y2="41.5" fill="none" stroke="#000" strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                    <polyline points="3637.82 2422.22 3715.6 2419.25 3792.69 2411.75 3869.77 2399.02 3946.08 2381.84 4020.19 2358.72 4093.53 2331.78 4164.6 2299.68 4233.41 2263.05 4299.24 2221.89 4362.9 2176.28 4423.5 2127 4480.36 2073.19 4533.47 2016.33 4582.9 1956.59 4628.51 1893.01 4669.67 1827.25 4706.38 1758.45 4738.56 1687.45 4765.5 1614.2 4788.7 1540.23 4805.88 1463.93 4818.61 1387 4826.81 1310 4829.07 1231.51 4826.81 1153.8 4818.61 1076.79 4805.88 999.78 4788.7 923.56 4765.5 849.52 4738.56 776.26 4706.38 705.27 4669.67 636.54 4628.51 570.7 4582.9 507.21 4533.47 447.38 4480.36 390.6 4423.5 336.79 4362.9 287.43 4299.24 241.82 4233.41 200.74 4164.6 164.11 4093.53 131.94 4020.19 105.07 3946.08 81.87 3869.77 64.69 3792.69 51.96 3715.6 44.46 3637.82 41.5" fill="none" stroke="#000" strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                    <polyline points="1231.24 41.5 1153.45 44.46 1076.37 51.96 999.28 64.69 922.98 81.87 848.87 105.07 775.53 131.94 704.46 164.11 635.65 200.74 569.81 241.82 506.16 287.43 445.56 336.79 388.7 390.6 335.59 447.38 286.15 507.21 240.54 570.7 199.38 636.54 162.68 705.27 130.5 776.26 103.56 849.52 80.36 923.56 63.18 999.78 50.45 1076.79 42.25 1153.8 39.98 1232.21 42.25 1310 50.45 1387 63.18 1463.93 80.36 1540.23 103.56 1614.2 130.5 1687.45 162.68 1758.45 199.38 1827.25 240.54 1893.01 286.15 1956.59 335.59 2016.33 388.7 2073.19 445.56 2127 506.16 2176.28 569.81 2221.89 635.65 2263.05 704.46 2299.68 775.53 2331.78 848.87 2358.72 922.98 2381.84 999.28 2399.02 1076.37 2411.75 1153.45 2419.25 1231.24 2422.22" fill="none" stroke="#000" strokeLinecap="square" strokeLinejoin="bevel" strokeWidth="80" />
                </g>
                {makeTrack()}
            </svg>
            <div
                style={{
                    textAlign: 'center',
                    marginTop: theme.spacing.sm,
                    borderTop: `1px solid ${theme.colors.gray[600]}`,
                    paddingTop: theme.spacing.xs
                }}
            >
                <div style={{ display: 'inline-block' }}>
                    <Button size="sm" variant={makeVariant(1)} style={{ marginRight: theme.spacing.xs, minWidth: '70px' }} onClick={() => selectTrack(1)}>Track 1</Button>
                    <Button size="sm" variant={makeVariant(2)} style={{ marginRight: theme.spacing.xs, minWidth: '70px' }} onClick={() => selectTrack(2)}>Track 2</Button>
                    <Button size="sm" variant={makeVariant(3)} style={{ marginRight: theme.spacing.xs, minWidth: '70px' }} onClick={() => selectTrack(3)}>Track 3</Button>
                    <Button size="sm" variant={makeVariant(0)} style={{ minWidth: '70px' }} onClick={() => selectTrack(0)}>Loop</Button>
                </div>
            </div>
        </div>
    )
}
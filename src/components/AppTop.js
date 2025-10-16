import React, { useState } from 'react'
import Toolbar from "./Toolbar";
import Layout from '../layouts/Layout';
import { Route, Routes } from 'react-router-dom';
import Decoders from './decoders/Decoders';
import Consists from './consists/Consists';
import Locomotives from './locomotives/Locomotives';
import Switches from './switches/Switches';
import Accessories from './accessories/Accessories';
import Macros from './macros/Macros';
import CVedit from '../CVedit';
import AccessoryButtons from './accessories/AccessoryButtons';
import LocoControl from '../modals/LocoControl';
import Settings from './Settings';
import ProgrammingTrack from './ProgrammingTrack';
import LocoBar from './locoBar/LocoBar';


export default function AppTop() {
    const [state, setState] = useState({ selectedLoco: 0, activeTrack: 0 })

    const setTrack = (track) => setState(old => ({ ...old, activeTrack: track }))
    const selectLoco = (locoIndex) => setState(old => ({ ...old, selectedLoco: locoIndex }))

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div><Toolbar /></div>
            <div style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', maxWidth: '100%', maxHeight: '100%', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: '300px', height: '100%', overflow: 'hidden' }}><LocoControl selectedLoco={state.selectedLoco} /></div>
                    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', height: '100%' }}>
                        <Routes>
                            <Route path="/locomotives/*" element={<Locomotives />} />
                            <Route path="/decoders/*" element={<Decoders />} />
                            <Route path="/consists/*" element={<Consists />} />
                            <Route path="/switches/*" element={<Switches />} />
                            <Route path="/accessories/*" element={<Accessories />} />
                            <Route path="/macros/*" element={<Macros />} />
                            <Route path="/cv/*" element={<CVedit />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/programming" element={<ProgrammingTrack />} />
                            <Route path="*" element={
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <LocoBar selectedLoco={state.selectedLoco} selectLoco={selectLoco} />
                                    <div style={{
                                        height: '100%', width: '100%', maxWidth: '100%', display: 'flex',
                                        flexDirection: 'column', overflow: 'hidden', backgroundColor: 'rgb(123,125,125)'
                                    }}>
                                        <Layout activeTrack={state.activeTrack} setActiveTrack={setTrack} />
                                    </div>
                                    <div style={{ padding: '10px' }}><AccessoryButtons /></div>
                                </div>
                            }
                            />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    )
}
import React from 'react'
import { Button } from '../ui'

export default function ButtonTest() {
    return (
        <div style={{ padding: '20px' }}>
            <h2>Button Component Test</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Variants (Medium Size)</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="info">Info</Button>
                    <Button variant="light">Light</Button>
                    <Button variant="dark">Dark</Button>
                    <Button variant="outline-secondary">Outline</Button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Sizes (Primary Variant)</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="md">Medium</Button>
                    <Button variant="primary" size="lg">Large</Button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Disabled State</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button variant="primary" disabled>Primary Disabled</Button>
                    <Button variant="secondary" disabled>Secondary Disabled</Button>
                    <Button variant="danger" disabled>Danger Disabled</Button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>With Custom Styles</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="primary" style={{ width: '150px' }}>Wide Button</Button>
                    <Button variant="danger" style={{ marginLeft: '8px' }}>With Margin</Button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Interactive</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => alert('Clicked!')}
                    >
                        Click Me
                    </Button>
                    <Button 
                        variant="warning" 
                        onDoubleClick={() => alert('Double clicked!')}
                    >
                        Double Click Me
                    </Button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Real App Examples</h3>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Button variant="danger" style={{ width: '150px' }} size="sm">E-STOP ALL</Button>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Button variant="success" size="sm">Forward</Button>
                        <Button variant="outline-secondary" size="sm">Reverse</Button>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Button variant="secondary" size="sm">Headlight</Button>
                        <Button variant="secondary" size="sm">Bell</Button>
                        <Button variant="secondary" size="sm">Horn</Button>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Button variant="primary" size="sm">Track 1</Button>
                        <Button variant="primary" size="sm">Track 2</Button>
                        <Button variant="secondary" size="sm">Track 3</Button>
                        <Button variant="secondary" size="sm">Loop</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

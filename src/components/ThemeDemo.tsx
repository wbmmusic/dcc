import React, { useState } from 'react'
import { Button, Table, Select, Modal, Tooltip, Dropdown, Spinner, IconButton, useTheme } from '../ui'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function ThemeDemo() {
    const theme = useTheme()
    const [showModal, setShowModal] = useState(false)
    const [selectValue, setSelectValue] = useState(null)

    const selectOptions = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' },
    ]

    return (
        <div style={{ height: '100%', overflow: 'hidden', overflowY: 'auto', backgroundColor: theme.colors.background.dark, color: theme.colors.light }}>
            <div style={{ padding: theme.spacing.lg, maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: theme.spacing.lg }}>Theme Demonstration</h1>

            {/* Colors Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Theme Colors</h2>
                <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
                    {Object.entries(theme.colors).filter(([key]) => !key.includes('gray') && !key.includes('background')).map(([name, color]) => (
                        <div key={name} style={{ textAlign: 'center' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                backgroundColor: color,
                                borderRadius: theme.borderRadius.md,
                                border: '1px solid #ddd',
                            }} />
                            <div style={{ fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs }}>{name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Buttons Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Buttons</h2>
                
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>Variants</h3>
                    <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
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

                <div style={{ marginBottom: theme.spacing.md }}>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>Sizes</h3>
                    <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>States</h3>
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                        <Button>Normal</Button>
                        <Button disabled>Disabled</Button>
                    </div>
                </div>
            </section>

            {/* Table Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Tables</h2>
                
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>Striped Table</h3>
                    <Table striped>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Number</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Item 1</td>
                                <td>001</td>
                                <td>Active</td>
                            </tr>
                            <tr>
                                <td>Item 2</td>
                                <td>002</td>
                                <td>Inactive</td>
                            </tr>
                            <tr>
                                <td>Item 3</td>
                                <td>003</td>
                                <td>Active</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>

                <div style={{ marginBottom: theme.spacing.md }}>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>Small Borderless Table</h3>
                    <Table size="sm" borderless>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Label:</td>
                                <td>Value</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Address:</td>
                                <td>1234</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Model:</td>
                                <td>SD70ACe</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </section>

            {/* Select Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Select Dropdown</h2>
                <div style={{ maxWidth: '300px' }}>
                    <Select
                        options={selectOptions}
                        value={selectValue}
                        onChange={setSelectValue}
                        placeholder="Choose an option..."
                    />
                    {selectValue && (
                        <div style={{ marginTop: theme.spacing.sm, fontSize: theme.fontSize.sm }}>
                            Selected: {selectValue.label}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Modal</h2>
                <Button onClick={() => setShowModal(true)}>Open Modal</Button>
                
                <Modal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    title="Modal Title"
                    footer={
                        <>
                            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" size="sm" onClick={() => setShowModal(false)}>Confirm</Button>
                        </>
                    }
                >
                    This is a custom modal component using our theme system.
                    It has a header, body, and footer with consistent styling.
                </Modal>
            </section>

            {/* Tooltip Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Tooltip</h2>
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                    <Tooltip text="This is a tooltip!">
                        <Button>Hover me</Button>
                    </Tooltip>
                    <Tooltip text="Tooltips work on any element">
                        <div style={{ padding: theme.spacing.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius }}>
                            Hover this div
                        </div>
                    </Tooltip>
                </div>
            </section>

            {/* Dropdown Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Dropdown</h2>
                <Dropdown
                    label="Actions"
                    items={[
                        { label: 'Edit', onClick: () => alert('Edit clicked') },
                        { label: 'Delete', onClick: () => alert('Delete clicked') },
                        { label: 'Settings', onClick: () => alert('Settings clicked') }
                    ]}
                />
            </section>

            {/* Spinner Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Spinner & Loading States</h2>
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>Spinner Sizes</h3>
                    <div style={{ display: 'flex', gap: theme.spacing.lg, alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Spinner size="sm" />
                            <div style={{ fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs }}>Small</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Spinner size="md" />
                            <div style={{ fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs }}>Medium</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Spinner size="lg" />
                            <div style={{ fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs }}>Large</div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>Loading Buttons</h3>
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                        <Button loading>Loading...</Button>
                        <Button variant="success" loading size="sm">Save</Button>
                        <Button variant="danger" loading size="lg">Delete</Button>
                    </div>
                </div>
            </section>

            {/* IconButton Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Icon Buttons</h2>
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h3 style={{ fontSize: theme.fontSize.md, marginBottom: theme.spacing.sm }}>Sizes & Colors</h3>
                    <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                        <IconButton size="small"><EditOutlinedIcon /></IconButton>
                        <IconButton size="medium"><EditOutlinedIcon /></IconButton>
                        <IconButton size="large"><EditOutlinedIcon /></IconButton>
                        <IconButton color="danger"><DeleteForeverIcon /></IconButton>
                        <IconButton color="primary"><EditOutlinedIcon /></IconButton>
                    </div>
                </div>
            </section>

            {/* Spacing Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Spacing Scale</h2>
                <div>
                    {Object.entries(theme.spacing).map(([name, value]) => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                            <div style={{ width: '60px', fontSize: theme.fontSize.sm }}>{name}:</div>
                            <div style={{ 
                                width: value, 
                                height: '20px', 
                                backgroundColor: theme.colors.primary,
                                marginRight: theme.spacing.sm,
                            }} />
                            <div style={{ fontSize: theme.fontSize.sm }}>{value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Typography Section */}
            <section style={sectionStyle(theme)}>
                <h2 style={sectionTitleStyle(theme)}>Typography</h2>
                <div style={{ fontSize: theme.fontSize.xs }}>Extra Small Text (xs)</div>
                <div style={{ fontSize: theme.fontSize.sm }}>Small Text (sm)</div>
                <div style={{ fontSize: theme.fontSize.md }}>Medium Text (md)</div>
                <div style={{ fontSize: theme.fontSize.lg }}>Large Text (lg)</div>
                <div style={{ fontSize: theme.fontSize.xl }}>Extra Large Text (xl)</div>
            </section>
            </div>
        </div>
    )
}

const sectionStyle = (theme) => ({
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[800],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.gray[600]}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
})

const sectionTitleStyle = (theme) => ({
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    borderBottom: `2px solid ${theme.colors.gray[600]}`,
    paddingBottom: theme.spacing.sm,
    color: theme.colors.warning,
})

export const selectStyle = {
    control: (base: any) => ({
        ...base,
        fontSize: '12px',
        minHeight: '15px',
        backgroundColor: '#212121',
        borderColor: '#424242',
        color: '#e8e8e8'
    }),
    menu: (base: any) => ({
        ...base,
        fontSize: '12px',
        backgroundColor: '#212121',
        borderColor: '#424242'
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isFocused ? '#303030' : '#212121',
        color: '#e8e8e8',
        cursor: 'pointer'
    }),
    multiValue: (base: any) => ({
        ...base,
        backgroundColor: '#424242'
    }),
    multiValueLabel: (base: any) => ({
        ...base,
        color: '#e8e8e8'
    }),
    multiValueRemove: (base: any) => ({
        ...base,
        color: '#e8e8e8',
        ':hover': {
            backgroundColor: '#d32f2f',
            color: '#e8e8e8'
        }
    }),
    singleValue: (base: any) => ({
        ...base,
        color: '#e8e8e8'
    }),
    input: (base: any) => ({
        ...base,
        color: '#e8e8e8'
    }),
    dropdownIndicator: (base: any) => ({
        ...base,
        padding: '0px 8px',
        color: '#9e9e9e'
    }),
    clearIndicator: (base: any) => ({
        ...base,
        color: '#9e9e9e'
    }),
    valueContainer: (base: any) => ({
        ...base,
        padding: '0px 8px'
    })
}
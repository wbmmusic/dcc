export const selectStyle = {
    control: base => ({
        ...base,
        fontSize: '12px',
        minHeight: '15px',
        backgroundColor: '#212121',
        borderColor: '#424242',
        color: '#e8e8e8'
    }),
    menu: base => ({
        ...base,
        fontSize: '12px',
        backgroundColor: '#212121',
        borderColor: '#424242'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#303030' : '#212121',
        color: '#e8e8e8',
        cursor: 'pointer'
    }),
    multiValue: base => ({
        ...base,
        backgroundColor: '#424242'
    }),
    multiValueLabel: base => ({
        ...base,
        color: '#e8e8e8'
    }),
    multiValueRemove: base => ({
        ...base,
        color: '#e8e8e8',
        ':hover': {
            backgroundColor: '#d32f2f',
            color: '#e8e8e8'
        }
    }),
    singleValue: base => ({
        ...base,
        color: '#e8e8e8'
    }),
    input: base => ({
        ...base,
        color: '#e8e8e8'
    }),
    dropdownIndicator: base => ({
        ...base,
        padding: '0px 8px',
        color: '#9e9e9e'
    }),
    clearIndicator: base => ({
        ...base,
        color: '#9e9e9e'
    }),
    valueContainer: base => ({
        ...base,
        padding: '0px 8px'
    })
}
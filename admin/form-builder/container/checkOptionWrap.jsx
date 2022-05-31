export const CheckOption = ({ htmlFor, checked, id, handler }) => (
    <div className="check-option-wrap">
        <label htmlFor={htmlFor}>
            <input
                name="uploadOption[]"
                checked={checked}
                type="checkbox" id={id}
                onChange={handler}
            />
        </label> .{htmlFor}
    </div>
)
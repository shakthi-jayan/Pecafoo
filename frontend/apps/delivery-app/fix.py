with open('src/pages/RegisterPage.jsx', 'r') as f:
    lines = f.readlines()

good_lines = lines[:192]

rest = [
    "                            <strong>Verification Documents</strong>\n",
    "                        </div>\n",
    "                        <FileField label=\"ID Proof\" name=\"id_proof\" />\n",
    "                        <FileField label=\"Driving License / Vehicle Permit\" name=\"license_image\" />\n",
    "                    </div>\n",
    "                    <button type=\"submit\" className=\"btn\" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, fontSize: '1rem', fontWeight: 700 }}>\n",
    "                        {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={20} />\n",
    "                    </button>\n",
    "                    </form>\n",
    "                )}\n",
    "                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)' }}>\n",
    "                    Already have an account? <Link to=\"/login\" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>\n",
    "                </p>\n",
    "            </motion.div>\n",
    "        </div>\n",
    "    );\n",
    "}\n"
]

with open('src/pages/RegisterPage.jsx', 'w') as f:
    f.writelines(good_lines + rest)

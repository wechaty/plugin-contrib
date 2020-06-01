import assert from 'assert'

function validatePlugin (plugin: any): void {
  if (typeof plugin !== 'function') {
    throw new Error('Plugin must be a function! we got type: ' + typeof plugin)
  }

  const name = plugin({} as any).name
  assert(name, 'should be set: ' + plugin.name + ' -> ' + name)
  assert(plugin.name + 'Plugin' === name, 'should follow the naming style: Name -> NamePlugin')
}

export {
  validatePlugin,
}
